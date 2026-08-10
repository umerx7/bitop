const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const { Transaction } = require('../models/Trade');
const websocketService = require('../services/websocket');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -twoFactorSecret -verificationToken -resetPasswordToken');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, preferences } },
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/transactions', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, currency, status, startDate, endDate } = req.query;
    const query = { user: req.user._id };
    
    if (type) query.type = type;
    if (currency) query.currency = currency.toUpperCase();
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
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

router.get('/activity', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const user = req.user;
    
    const [recentTrades, recentWithdrawals, recentDeposits, recentLogins] = await Promise.all([
      require('../models/Trade').Trade.find({ user: user._id }).sort({ createdAt: -1 }).limit(10),
      require('../models/Wallet').Withdrawal.find({ user: user._id }).sort({ createdAt: -1 }).limit(10),
      require('../models/Wallet').Deposit.find({ user: user._id }).sort({ createdAt: -1 }).limit(10),
      Promise.resolve([])
    ]);
    
    const activities = [
      ...recentTrades.map(t => ({ type: 'trade', action: `${t.type.toUpperCase()} ${t.filled} ${t.pair}`, amount: t.filled * t.price, currency: t.feeCurrency, status: t.status, timestamp: t.createdAt, id: t._id })),
      ...recentWithdrawals.map(w => ({ type: 'withdrawal', action: `Withdraw ${w.amount} ${w.currency}`, amount: w.amount, currency: w.currency, status: w.status, timestamp: w.createdAt, id: w._id })),
      ...recentDeposits.map(d => ({ type: 'deposit', action: `Deposit ${d.netAmount} ${d.currency}`, amount: d.netAmount, currency: d.currency, status: d.status, timestamp: d.createdAt, id: d._id }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
    
    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/2fa/enable', protect, async (req, res) => {
  try {
    const user = req.user;
    if (user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA already enabled' });
    }
    
    const secret = speakeasy.generateSecret({ name: `BITOP (${user.email})`, length: 32 });
    user.twoFactorSecret = secret.base32;
    await user.save({ validateBeforeSave: false });
    
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);
    
    res.json({ success: true, secret: secret.base32, qrCode, message: 'Scan QR code with authenticator app' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/2fa/verify', protect, async (req, res) => {
  try {
    const { token } = req.body;
    const user = req.user;
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });
    
    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA code' });
    }
    
    user.twoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });
    
    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/2fa/disable', protect, async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findById(req.user._id).select('+password +twoFactorSecret');
    
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA not enabled' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });
    
    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA code' });
    }
    
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save({ validateBeforeSave: false });
    
    res.json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/api-keys', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('apiKeys');
    res.json({ success: true, apiKeys: user.apiKeys || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/api-keys', protect, async (req, res) => {
  try {
    const { name, permissions, ipWhitelist } = req.body;
    const user = await User.findById(req.user._id);
    
    const apiKey = 'bitop_' + crypto.randomBytes(24).toString('hex');
    const apiSecret = crypto.randomBytes(32).toString('hex');
    
    if (!user.apiKeys) user.apiKeys = [];
    user.apiKeys.push({
      name,
      key: apiKey,
      secret: crypto.createHash('sha256').update(apiSecret).digest('hex'),
      permissions: permissions || ['read'],
      ipWhitelist: ipWhitelist || [],
      createdAt: new Date(),
      lastUsed: null
    });
    
    await user.save({ validateBeforeSave: false });
    
    res.status(201).json({ success: true, apiKey, apiSecret, message: 'Save the secret key - it will not be shown again' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/api-keys/:id', protect, validateObjectId(), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.apiKeys = user.apiKeys.filter(k => k._id.toString() !== req.params.id);
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'API key deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/notifications', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const user = req.user;
    
    const notifications = user.notifications || [];
    let filtered = notifications;
    if (unread === 'true') filtered = notifications.filter(n => !n.read);
    
    const paginated = filtered
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice((page - 1) * limit, page * limit);
    
    res.json({ success: true, notifications: paginated, unreadCount: notifications.filter(n => !n.read).length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notification = user.notifications.id(req.params.id);
    if (notification) {
      notification.read = true;
      notification.readAt = new Date();
      await user.save({ validateBeforeSave: false });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/notifications/read-all', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.notifications.forEach(n => { n.read = true; n.readAt = new Date(); });
    await user.save({ validateBeforeSave: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;