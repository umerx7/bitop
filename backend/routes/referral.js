const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const websocketService = require('../services/websocket');
const crypto = require('crypto');

router.get('/info', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode referralEarnings referredBy');
    res.json({ success: true, referral: { code: user.referralCode, earnings: user.referralEarnings, referredBy: user.referredBy } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/referrals', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const referrals = await User.find({ referredBy: req.user._id })
      .select('name email isVerified createdAt referralEarnings')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments({ referredBy: req.user._id });
    const verified = await User.countDocuments({ referredBy: req.user._id, isVerified: true });
    const totalEarnings = referrals.reduce((sum, r) => sum + (r.referralEarnings || 0), 0);
    
    res.json({
      success: true,
      referrals,
      stats: { total, verified, totalEarnings },
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/earnings', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const user = req.user;
    
    const earnings = [];
    const referrals = await User.find({ referredBy: user._id, isVerified: true }).select('name email createdAt referralEarnings');
    
    referrals.forEach(r => {
      earnings.push({
        type: 'signup_bonus',
        amount: 10,
        currency: 'USDT',
        fromUser: { id: r._id, name: r.name, email: r.email },
        createdAt: r.createdAt,
        status: 'completed'
      });
    });
    
    const paginated = earnings
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice((page - 1) * limit, page * limit);
    
    res.json({ success: true, earnings: paginated, total: earnings.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/link', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode');
    const link = `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`;
    res.json({ success: true, link, code: user.referralCode });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/withdraw', protect, async (req, res) => {
  try {
    const user = req.user;
    if (user.referralEarnings < 10) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal is 10 USDT' });
    }
    
    const amount = user.referralEarnings;
    user.referralEarnings = 0;
    await user.save({ validateBeforeSave: false });
    
    let balance = user.balances.find(b => b.currency === 'USDT');
    if (!balance) {
      balance = { currency: 'USDT', available: 0, locked: 0 };
      user.balances.push(balance);
    }
    balance.available += amount;
    await user.save({ validateBeforeSave: false });
    
    await require('../models/Trade').Transaction.create({
      user: user._id,
      type: 'referral',
      currency: 'USDT',
      amount,
      netAmount: amount,
      status: 'completed',
      description: 'Referral earnings withdrawal',
      processedAt: new Date(),
      completedAt: new Date()
    });
    
    websocketService.broadcastToUser(user._id, 'balance:updated', { currency: 'USDT', available: balance.available });
    
    res.json({ success: true, message: `${amount} USDT withdrawn from referral earnings`, amount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;