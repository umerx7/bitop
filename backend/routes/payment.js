const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect, authorize } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');
const websocketService = require('../services/websocket');
const crypto = require('crypto');

const CRYPTO_WALLETS = {
  USDT: {
    TRC20: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    ERC20: '0x742d35Cc6634C0532925a3b8D0B3d1D6cD8d8E4F',
  },
  BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ETH: '0x742d35Cc6634C0532925a3b8D0B3d1D6cD8d8E4F',
};

const BANK_DETAILS = {
  bankName: 'BITOP Global Bank',
  swift: 'BITOGB2L',
  iban: 'GB29NWBK60161331926819',
  accountName: 'BITOP Trading Ltd',
  reference: 'BITOP-{userId}',
};

const CARD_LIMITS = {
  min: 10,
  max: 50000,
  feePercent: 2.5,
};

const WIRE_LIMITS = {
  min: 100,
  max: 1000000,
  fee: 25,
};

router.get('/methods', protect, async (req, res) => {
  try {
    const methods = [
      {
        id: 'crypto',
        name: 'Cryptocurrency',
        icon: '₿',
        description: 'USDT TRC20, USDT ERC20, Bitcoin, Ethereum',
        networks: ['USDT-TRC20', 'USDT-ERC20', 'BTC', 'ETH'],
        minAmount: 1,
        maxAmount: 1000000,
        feePercent: 0,
        processingTime: '5-30 minutes',
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: '💳',
        description: 'Visa, Mastercard, American Express',
        networks: ['Visa', 'Mastercard', 'Amex'],
        minAmount: CARD_LIMITS.min,
        maxAmount: CARD_LIMITS.max,
        feePercent: CARD_LIMITS.feePercent,
        processingTime: 'Instant',
      },
      {
        id: 'bank_wire',
        name: 'Bank Wire Transfer',
        icon: '🏦',
        description: 'SWIFT/IBAN - International only',
        networks: ['SWIFT', 'IBAN'],
        minAmount: WIRE_LIMITS.min,
        maxAmount: WIRE_LIMITS.max,
        feeAmount: WIRE_LIMITS.fee,
        processingTime: '1-3 business days',
      },
    ];
    res.json({ success: true, methods });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/deposit', protect, async (req, res) => {
  try {
    const { method, currency, amount, fiatCurrency = 'USD', details } = req.body;
    const user = req.user;

    if (!method || !currency || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid parameters' });
    }

    let transaction;
    const reference = `DEP-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    if (method === 'crypto') {
      const network = details?.network;
      const walletAddress = CRYPTO_WALLETS[currency]?.[network] || CRYPTO_WALLETS[currency];
      
      if (!walletAddress) {
        return res.status(400).json({ success: false, message: 'Unsupported currency/network' });
      }

      transaction = await Transaction.create({
        user: user._id,
        type: 'deposit',
        method: 'crypto',
        currency: currency.toUpperCase(),
        amount,
        netAmount: amount,
        status: 'awaiting_payment',
        reference,
        address: walletAddress,
        network: network?.toUpperCase(),
        metadata: { network, walletAddress },
        description: `Crypto deposit: ${amount} ${currency} via ${network}`,
      });

      res.json({
        success: true,
        transaction: {
          id: transaction._id,
          reference: transaction.reference,
          address: walletAddress,
          network: network?.toUpperCase(),
          currency: currency.toUpperCase(),
          amount,
          qrData: `${currency.toLowerCase()}:${walletAddress}?amount=${amount}`,
          status: 'awaiting_payment',
          instructions: `Send exactly ${amount} ${currency} to the address above via ${network} network.`,
        },
      });

    } else if (method === 'card') {
      const fee = Math.round(amount * (CARD_LIMITS.feePercent / 100) * 100) / 100;
      const netAmount = amount - fee;

      if (amount < CARD_LIMITS.min || amount > CARD_LIMITS.max) {
        return res.status(400).json({ 
          success: false, 
          message: `Card deposits must be between $${CARD_LIMITS.min} and $${CARD_LIMITS.max}` 
        });
      }

      transaction = await Transaction.create({
        user: user._id,
        type: 'fiat_deposit',
        method: 'card',
        currency: 'USDT',
        fiatCurrency: fiatCurrency.toUpperCase(),
        amount,
        fee,
        netAmount,
        status: 'pending',
        reference,
        description: `Card deposit: ${fiatCurrency} ${amount} (fee: ${fee})`,
        cardDetails: {
          last4: details?.cardNumber?.slice(-4),
          brand: details?.brand || 'Visa',
          expiryMonth: details?.expiryMonth,
          expiryYear: details?.expiryYear,
        },
        metadata: { cardholderName: details?.cardholderName },
      });

      res.json({
        success: true,
        transaction: {
          id: transaction._id,
          reference: transaction.reference,
          amount,
          fee,
          netAmount,
          currency: 'USDT',
          status: 'pending',
          message: 'Card deposit simulated. In production, this would redirect to payment gateway.',
        },
      });

    } else if (method === 'bank_wire') {
      const fee = WIRE_LIMITS.fee;
      const netAmount = amount - fee;

      if (amount < WIRE_LIMITS.min || amount > WIRE_LIMITS.max) {
        return res.status(400).json({ 
          success: false, 
          message: `Wire transfers must be between $${WIRE_LIMITS.min} and $${WIRE_LIMITS.max}` 
        });
      }

      transaction = await Transaction.create({
        user: user._id,
        type: 'fiat_deposit',
        method: 'bank_wire',
        currency: 'USDT',
        fiatCurrency: fiatCurrency.toUpperCase(),
        amount,
        fee,
        netAmount,
        status: 'awaiting_payment',
        reference,
        description: `Wire deposit: ${fiatCurrency} ${amount} (fee: $${fee})`,
        bankDetails: {
          bankName: BANK_DETAILS.bankName,
          accountHolder: BANK_DETAILS.accountName,
          iban: BANK_DETAILS.iban,
          swift: BANK_DETAILS.swift,
          reference: BANK_DETAILS.reference.replace('{userId}', user._id.toString().slice(-8)),
        },
        metadata: { 
          senderName: details?.senderName,
          senderBank: details?.senderBank,
        },
      });

      res.json({
        success: true,
        transaction: {
          id: transaction._id,
          reference: transaction.reference,
          amount,
          fee,
          netAmount,
          currency: 'USDT',
          status: 'awaiting_payment',
          bankDetails: {
            bankName: BANK_DETAILS.bankName,
            swift: BANK_DETAILS.swift,
            iban: BANK_DETAILS.iban,
            accountName: BANK_DETAILS.accountName,
            reference: BANK_DETAILS.reference.replace('{userId}', user._id.toString().slice(-8)),
          },
          instructions: `Wire transfer ${fiatCurrency} ${amount} to the account above. Include reference: ${transaction.reference}`,
        },
      });

    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    websocketService.broadcastToUser(user._id, 'transaction:created', {
      transaction: { id: transaction._id, type: transaction.type, amount: transaction.amount, status: transaction.status }
    });

  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/withdraw', protect, async (req, res) => {
  try {
    const { method, currency, amount, fiatCurrency = 'USD', details } = req.body;
    const user = req.user;

    if (!method || !currency || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid parameters' });
    }

    const usdtBalance = user.balances.find(b => b.currency === 'USDT');
    const cryptoBalance = user.balances.find(b => b.currency === currency.toUpperCase());
    
    let availableBalance = 0;
    if (method === 'crypto' && cryptoBalance) {
      availableBalance = cryptoBalance.available;
    } else if (method !== 'crypto' && usdtBalance) {
      availableBalance = usdtBalance.available;
    }

    if (availableBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    let transaction;
    const reference = `WTH-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    if (method === 'crypto') {
      const network = details?.network;
      const address = details?.address;
      
      if (!address || !network) {
        return res.status(400).json({ success: false, message: 'Address and network required for crypto withdrawal' });
      }

      const feeRates = { USDT: { TRC20: 1, ERC20: 10 }, BTC: 0.0005, ETH: 0.005 };
      const fee = feeRates[currency]?.[network] || feeRates[currency] || 1;
      const netAmount = amount - fee;

      if (netAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount too small after fees' });
      }

      if (cryptoBalance) {
        cryptoBalance.available -= amount;
        cryptoBalance.locked += amount;
        await user.save({ validateBeforeSave: false });
      }

      transaction = await Transaction.create({
        user: user._id,
        type: 'withdrawal',
        method: 'crypto',
        currency: currency.toUpperCase(),
        amount,
        fee,
        netAmount,
        status: 'awaiting_approval',
        reference,
        address,
        network: network.toUpperCase(),
        description: `Crypto withdrawal: ${amount} ${currency} via ${network} to ${address.slice(0,10)}...`,
        metadata: { network, destinationAddress: address },
      });

    } else if (method === 'card') {
      const fee = Math.round(amount * (CARD_LIMITS.feePercent / 100) * 100) / 100;
      const netAmount = amount - fee;

      if (amount < CARD_LIMITS.min || amount > CARD_LIMITS.max) {
        return res.status(400).json({ 
          success: false, 
          message: `Card withdrawals must be between $${CARD_LIMITS.min} and $${CARD_LIMITS.max}` 
        });
      }

      if (usdtBalance) {
        usdtBalance.available -= amount;
        usdtBalance.locked += amount;
        await user.save({ validateBeforeSave: false });
      }

      transaction = await Transaction.create({
        user: user._id,
        type: 'fiat_withdrawal',
        method: 'card',
        currency: 'USDT',
        fiatCurrency: fiatCurrency.toUpperCase(),
        amount,
        fee,
        netAmount,
        status: 'awaiting_approval',
        reference,
        description: `Card withdrawal: ${fiatCurrency} ${amount} (fee: ${fee}) to card ending ${details?.cardNumber?.slice(-4)}`,
        cardDetails: {
          last4: details?.cardNumber?.slice(-4),
          brand: details?.brand || 'Visa',
          expiryMonth: details?.expiryMonth,
          expiryYear: details?.expiryYear,
        },
        metadata: { cardholderName: details?.cardholderName },
      });

    } else if (method === 'bank_wire') {
      const fee = WIRE_LIMITS.fee;
      const netAmount = amount - fee;

      if (amount < WIRE_LIMITS.min || amount > WIRE_LIMITS.max) {
        return res.status(400).json({ 
          success: false, 
          message: `Wire withdrawals must be between $${WIRE_LIMITS.min} and $${WIRE_LIMITS.max}` 
        });
      }

      if (!details?.iban || !details?.swift || !details?.bankName || !details?.accountHolder) {
        return res.status(400).json({ success: false, message: 'All bank details required for wire withdrawal' });
      }

      if (usdtBalance) {
        usdtBalance.available -= amount;
        usdtBalance.locked += amount;
        await user.save({ validateBeforeSave: false });
      }

      transaction = await Transaction.create({
        user: user._id,
        type: 'fiat_withdrawal',
        method: 'bank_wire',
        currency: 'USDT',
        fiatCurrency: fiatCurrency.toUpperCase(),
        amount,
        fee,
        netAmount,
        status: 'awaiting_approval',
        reference,
        description: `Wire withdrawal: ${fiatCurrency} ${amount} (fee: $${fee}) to ${details.bankName}`,
        bankDetails: {
          bankName: details.bankName,
          accountHolder: details.accountHolder,
          iban: details.iban,
          swift: details.swift,
        },
        metadata: { accountType: details.accountType },
      });

    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    websocketService.broadcastToUser(user._id, 'transaction:created', {
      transaction: { id: transaction._id, type: transaction.type, amount: transaction.amount, status: transaction.status }
    });

    res.status(201).json({ success: true, transaction });

  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/history', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, method, status, currency } = req.query;
    const query = { user: req.user._id };
    
    if (type) query.type = type;
    if (method) query.method = method;
    if (status) query.status = status;
    if (currency) query.currency = currency.toUpperCase();

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/simulate/:id', protect, async (req, res) => {
  try {
    const { action } = req.body;
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (action === 'complete' && transaction.status === 'awaiting_payment') {
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      
      if (transaction.type === 'deposit' || transaction.type === 'fiat_deposit') {
        let balance = req.user.balances.find(b => b.currency === 'USDT');
        if (!balance) {
          balance = { currency: 'USDT', available: 0, locked: 0 };
          req.user.balances.push(balance);
        }
        balance.available += transaction.netAmount;
        await req.user.save({ validateBeforeSave: false });
      }
      
      await transaction.save();
      
      websocketService.broadcastToUser(req.user._id, 'transaction:completed', {
        transaction: { id: transaction._id, status: 'completed', amount: transaction.netAmount }
      });
      
      return res.json({ success: true, transaction });
    }

    if (action === 'cancel' && ['pending', 'awaiting_payment', 'awaiting_approval'].includes(transaction.status)) {
      transaction.status = 'cancelled';
      await transaction.save();
      
      if (transaction.type === 'withdrawal' || transaction.type === 'fiat_withdrawal') {
        let balance = req.user.balances.find(b => b.currency === 'USDT');
        if (balance) {
          balance.locked -= transaction.amount;
          balance.available += transaction.amount;
          await req.user.save({ validateBeforeSave: false });
        }
      }
      
      return res.json({ success: true, transaction });
    }

    res.status(400).json({ success: false, message: 'Invalid action or transaction state' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/status/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, rejectionReason, adminNotes, txHash } = req.body;
    const transaction = await Transaction.findById(req.params.id).populate('user');
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const oldStatus = transaction.status;
    transaction.status = status;
    transaction.rejectionReason = rejectionReason;
    transaction.adminNotes = adminNotes;
    transaction.txHash = txHash || transaction.txHash;
    transaction.processedBy = req.user._id;
    transaction.processedAt = new Date();

    if (status === 'completed' && oldStatus !== 'completed') {
      transaction.completedAt = new Date();
      
      if (transaction.type === 'deposit' || transaction.type === 'fiat_deposit') {
        let balance = transaction.user.balances.find(b => b.currency === 'USDT');
        if (!balance) {
          balance = { currency: 'USDT', available: 0, locked: 0 };
          transaction.user.balances.push(balance);
        }
        balance.available += transaction.netAmount;
        await transaction.user.save({ validateBeforeSave: false });
      }
      
      if (transaction.type === 'withdrawal' || transaction.type === 'fiat_withdrawal') {
        const balance = transaction.user.balances.find(b => b.currency === 'USDT');
        if (balance) {
          balance.locked -= transaction.amount;
          await transaction.user.save({ validateBeforeSave: false });
        }
      }
    }

    if (['rejected', 'cancelled', 'failed'].includes(status) && !['rejected', 'cancelled', 'failed'].includes(oldStatus)) {
      if (transaction.type === 'withdrawal' || transaction.type === 'fiat_withdrawal') {
        const balance = transaction.user.balances.find(b => b.currency === 'USDT');
        if (balance) {
          balance.locked -= transaction.amount;
          balance.available += transaction.amount;
          await transaction.user.save({ validateBeforeSave: false });
        }
      }
    }

    await transaction.save();

    websocketService.broadcastToUser(transaction.user._id, 'transaction:updated', {
      transaction: { id: transaction._id, status: transaction.status, txHash: transaction.txHash }
    });

    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Admin transaction update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/crypto-addresses', protect, async (req, res) => {
  try {
    res.json({ success: true, addresses: CRYPTO_WALLETS });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;