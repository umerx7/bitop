const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Withdrawal, Deposit, PaymentMethod } = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { protect, authorize } = require('../middleware/auth');
const { validateWithdrawal, validateDeposit, validateObjectId, validatePagination } = require('../middleware/validation');
const { sendWithdrawalConfirmationEmail } = require('../utils/email');
const websocketService = require('../services/websocket');
const crypto = require('crypto');

router.get('/balances', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('balances');
    res.json({ success: true, balances: user.balances });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/deposits', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, currency } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (currency) query.currency = currency.toUpperCase();
    
    const deposits = await Deposit.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Deposit.countDocuments(query);
    
    res.json({
      success: true,
      deposits,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/transactions', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, currency } = req.query;
    const query = { user: req.user._id };
    if (type) query.type = type;
    if (currency) query.currency = currency.toUpperCase();
    
    const transactions = await Deposit.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Deposit.countDocuments(query);
    
    res.json({
      success: true,
      transactions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/deposit-assets', protect, async (req, res) => {
  try {
    const assets = [
      { currency: 'BTC', name: 'Bitcoin', networks: ['BTC', 'BEP20', 'ERC20', 'TRC20'], icon: '₿', minDeposit: 0.0001, confirmations: 3 },
      { currency: 'ETH', name: 'Ethereum', networks: ['ERC20', 'BEP20', 'ARBITRUM', 'OPTIMISM', 'POLYGON'], icon: 'Ξ', minDeposit: 0.001, confirmations: 12 },
      { currency: 'USDT', name: 'Tether USD', networks: ['TRC20', 'ERC20', 'BEP20', 'SOLANA', 'POLYGON', 'ARBITRUM', 'OPTIMISM'], icon: '₮', minDeposit: 1, confirmations: 1 },
      { currency: 'USDC', name: 'USD Coin', networks: ['ERC20', 'BEP20', 'SOLANA', 'POLYGON', 'ARBITRUM', 'OPTIMISM'], icon: '$', minDeposit: 1, confirmations: 1 },
      { currency: 'BNB', name: 'BNB', networks: ['BEP20', 'BEP2'], icon: '▶', minDeposit: 0.01, confirmations: 1 },
      { currency: 'SOL', name: 'Solana', networks: ['SOLANA'], icon: '◎', minDeposit: 0.01, confirmations: 1 },
      { currency: 'XRP', name: 'XRP', networks: ['XRP'], icon: '✕', minDeposit: 20, confirmations: 1 },
      { currency: 'ADA', name: 'Cardano', networks: ['CARDANO'], icon: '₳', minDeposit: 1, confirmations: 10 },
      { currency: 'DOGE', name: 'Dogecoin', networks: ['DOGE'], icon: 'Ð', minDeposit: 50, confirmations: 1 },
      { currency: 'MATIC', name: 'Polygon', networks: ['POLYGON', 'ERC20', 'BEP20'], icon: '◈', minDeposit: 1, confirmations: 1 },
      { currency: 'DOT', name: 'Polkadot', networks: ['POLKADOT'], icon: '●', minDeposit: 1, confirmations: 1 },
      { currency: 'AVAX', name: 'Avalanche', networks: ['AVALANCHE', 'ERC20'], icon: '▲', minDeposit: 0.01, confirmations: 1 }
    ];
    
    res.json({ success: true, assets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/deposit/address', protect, async (req, res) => {
  try {
    const { currency, network } = req.query;
    const user = req.user;
    
    const address = `${currency.toUpperCase()}-${user._id.toString().slice(-8)}-${network.toUpperCase()}`;
    const tag = currency.toUpperCase() === 'XRP' || currency.toUpperCase() === 'XLM' 
      ? Math.floor(Math.random() * 100000000).toString().padStart(9, '0') 
      : null;
    
    const minDeposits = { BTC: 0.0001, ETH: 0.001, USDT: 1, USDC: 1, BNB: 0.01, SOL: 0.01, XRP: 20, ADA: 1, DOGE: 50, MATIC: 1, DOT: 1, AVAX: 0.01 };
    const confirmationsMap = { BTC: 3, ETH: 12, USDT: 1, USDC: 1, BNB: 1, SOL: 1, XRP: 1, ADA: 10, DOGE: 1, MATIC: 1, DOT: 1, AVAX: 1 };
    
    res.json({ 
      success: true, 
      address: { 
        address, 
        tag, 
        network: network.toUpperCase(),
        minDeposit: minDeposits[currency.toUpperCase()] || 1,
        confirmations: confirmationsMap[currency.toUpperCase()] || 1
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/withdraw', protect, validateWithdrawal, async (req, res) => {
  try {
    const { currency, amount, address, network, tag, priority = 'normal' } = req.body;
    const user = req.user;
    
    const balance = user.balances.find(b => b.currency === currency.toUpperCase());
    if (!balance || balance.available < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }
    
    const feeRates = { normal: 0.001, high: 0.002, instant: 0.005 };
    const fee = amount * (feeRates[priority] || 0.001);
    const netAmount = amount - fee;
    
    if (netAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount too small after fees' });
    }
    
    const minAmounts = { BTC: 0.0005, ETH: 0.005, USDT: 10, USDC: 10, BNB: 0.01, SOL: 0.01 };
    const minAmount = minAmounts[currency.toUpperCase()] || 1;
    if (netAmount < minAmount) {
      return res.status(400).json({ success: false, message: `Minimum withdrawal amount is ${minAmount} ${currency}` });
    }
    
    balance.available -= amount;
    balance.locked += amount;
    await user.save({ validateBeforeSave: false });
    
    const withdrawal = await Withdrawal.create({
      user: user._id,
      currency: currency.toUpperCase(),
      amount,
      fee,
      netAmount,
      address,
      tag,
      network: network.toUpperCase(),
      priority,
      status: 'awaiting_approval',
      verificationToken: crypto.randomBytes(32).toString('hex'),
      verificationExpire: Date.now() + 30 * 60 * 1000,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    try {
      await sendWithdrawalConfirmationEmail(user, withdrawal);
    } catch (emailError) {
      console.error('Withdrawal email error:', emailError);
    }
    
    websocketService.broadcastToUser(user._id, 'withdrawal:created', {
      withdrawal: { id: withdrawal._id, currency: withdrawal.currency, amount: withdrawal.amount, status: withdrawal.status }
    });
    
    res.status(201).json({ success: true, withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/withdrawals', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, currency } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (currency) query.currency = currency.toUpperCase();
    
    const withdrawals = await Withdrawal.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Withdrawal.countDocuments(query);
    
    res.json({
      success: true,
      withdrawals,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/withdraw/:id/verify', protect, validateObjectId(), async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findOne({ _id: req.params.id, user: req.user._id });
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }
    
    if (withdrawal.status !== 'awaiting_approval') {
      return res.status(400).json({ success: false, message: 'Withdrawal cannot be verified' });
    }
    
    if (withdrawal.verificationExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'Verification token expired' });
    }
    
    const { token, twoFactorCode, emailCode } = req.body;
    
    if (token && withdrawal.verificationToken === crypto.createHash('sha256').update(token).digest('hex')) {
      withdrawal.emailVerified = true;
    }
    
    if (twoFactorCode && req.user.twoFactorEnabled) {
      const speakeasy = require('speakeasy');
      const verified = speakeasy.totp.verify({
        secret: req.user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1
      });
      if (verified) withdrawal.twoFactorVerified = true;
    }
    
    if (withdrawal.emailVerified && (!req.user.twoFactorEnabled || withdrawal.twoFactorVerified)) {
      withdrawal.status = 'pending';
      withdrawal.verificationToken = undefined;
      withdrawal.verificationExpire = undefined;
    }
    
    await withdrawal.save();
    
    websocketService.broadcastToUser(req.user._id, 'withdrawal:updated', {
      withdrawal: { id: withdrawal._id, status: withdrawal.status }
    });
    
    res.json({ success: true, withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/withdraw/:id', protect, validateObjectId(), async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findOne({ _id: req.params.id, user: req.user._id });
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }
    
    if (!['pending', 'awaiting_approval'].includes(withdrawal.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this withdrawal' });
    }
    
    const user = req.user;
    const balance = user.balances.find(b => b.currency === withdrawal.currency);
    balance.locked -= withdrawal.amount;
    balance.available += withdrawal.amount;
    await user.save({ validateBeforeSave: false });
    
    withdrawal.status = 'cancelled';
    await withdrawal.save();
    
    websocketService.broadcastToUser(user._id, 'withdrawal:cancelled', { withdrawalId: withdrawal._id });
    
    res.json({ success: true, message: 'Withdrawal cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/payment-methods', protect, async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, methods });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/payment-methods', protect, async (req, res) => {
  try {
    const { type, name, details } = req.body;
    const user = req.user;
    
    if (await PaymentMethod.findOne({ user: user._id, isDefault: true })) {
      await PaymentMethod.updateMany({ user: user._id }, { isDefault: false });
    }
    
    const method = await PaymentMethod.create({
      user: user._id,
      type,
      name,
      details,
      isDefault: true
    });
    
    res.status(201).json({ success: true, method });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/payment-methods/:id', protect, validateObjectId(), async (req, res) => {
  try {
    const { name, details, isDefault } = req.body;
    const method = await PaymentMethod.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, details, isDefault },
      { new: true, runValidators: true }
    );
    
    if (!method) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }
    
    if (isDefault) {
      await PaymentMethod.updateMany({ user: req.user._id, _id: { $ne: method._id } }, { isDefault: false });
    }
    
    res.json({ success: true, method });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/payment-methods/:id', protect, validateObjectId(), async (req, res) => {
  try {
    const method = await PaymentMethod.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!method) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }
    res.json({ success: true, message: 'Payment method deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/networks/:currency', protect, async (req, res) => {
  try {
    const { currency } = req.params;
    const networks = {
      BTC: ['BTC', 'BEP20', 'ERC20', 'TRC20'],
      ETH: ['ERC20', 'BEP20', 'ARBITRUM', 'OPTIMISM', 'POLYGON'],
      USDT: ['TRC20', 'ERC20', 'BEP20', 'SOLANA', 'POLYGON', 'ARBITRUM', 'OPTIMISM'],
      USDC: ['ERC20', 'BEP20', 'SOLANA', 'POLYGON', 'ARBITRUM', 'OPTIMISM'],
      BNB: ['BEP20', 'BEP2'],
      SOL: ['SOLANA'],
      XRP: ['XRP'],
      ADA: ['CARDANO'],
      DOGE: ['DOGE'],
      MATIC: ['POLYGON', 'ERC20', 'BEP20'],
      DOT: ['POLKADOT'],
      AVAX: ['AVALANCHE', 'ERC20'],
      LINK: ['ERC20', 'BEP20'],
      UNI: ['ERC20', 'BEP20'],
      LTC: ['LTC'],
      BCH: ['BCH'],
      ATOM: ['COSMOS'],
      NEAR: ['NEAR'],
      FTM: ['FANTOM', 'ERC20', 'BEP20'],
      ALGO: ['ALGORAND'],
      VET: ['VECHAIN'],
      FIL: ['FILECOIN'],
      TRX: ['TRON'],
      ETC: ['ETC'],
      XLM: ['STELLAR']
    };
    
    res.json({ success: true, networks: networks[currency.toUpperCase()] || ['MAINNET'] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/fees/:currency', protect, async (req, res) => {
  try {
    const { currency } = req.params;
    const fees = {
      BTC: { minWithdrawal: 0.0005, fee: 0.0005, networkFee: 0.0003 },
      ETH: { minWithdrawal: 0.005, fee: 0.005, networkFee: 0.003 },
      USDT: { minWithdrawal: 10, fee: 1, networkFee: 0.8 },
      USDC: { minWithdrawal: 10, fee: 1, networkFee: 0.8 },
      BNB: { minWithdrawal: 0.01, fee: 0.001, networkFee: 0.0005 },
      SOL: { minWithdrawal: 0.01, fee: 0.0005, networkFee: 0.0001 },
      XRP: { minWithdrawal: 20, fee: 0.25, networkFee: 0.00001 },
      ADA: { minWithdrawal: 1, fee: 1, networkFee: 0.2 },
      DOGE: { minWithdrawal: 50, fee: 5, networkFee: 1 },
      MATIC: { minWithdrawal: 1, fee: 0.1, networkFee: 0.01 }
    };
    
    res.json({ success: true, fees: fees[currency.toUpperCase()] || { minWithdrawal: 1, fee: 0.1, networkFee: 0.01 } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;