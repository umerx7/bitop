const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Withdrawal, Deposit, PaymentMethod } = require('../models/Wallet');
const { Trade, Transaction, OrderBook, PriceHistory } = require('../models/Trade');
const { ChatMessage, ChatSession } = require('../models/Chat');
const { Setting, SiteStats, AuditLog } = require('../models/Settings');
const { protect, authorize, logAudit } = require('../middleware/auth');
const { validateObjectId, validatePagination, validateChatMessage } = require('../middleware/validation');
const websocketService = require('../services/websocket');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      newUsersToday,
      activeUsersToday,
      totalTrades,
      totalVolume,
      pendingWithdrawals,
      pendingDeposits,
      openChats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 24*60*60*1000) } }),
      Trade.countDocuments(),
      Trade.aggregate([{ $match: { status: 'filled' } }, { $group: { _id: null, total: { $sum: { $multiply: ['$filled', '$price'] } } } }]),
      Withdrawal.countDocuments({ status: { $in: ['pending', 'awaiting_approval', 'processing'] } }),
      Deposit.countDocuments({ status: { $in: ['pending', 'awaiting_confirmation', 'processing'] } }),
      ChatSession.countDocuments({ status: { $in: ['open', 'waiting', 'active'] } })
    ]);
    
    const volume = totalVolume[0]?.total || 0;
    
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('name email role isVerified createdAt');
    const recentTrades = await Trade.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10);
    const recentWithdrawals = await Withdrawal.find({ status: { $in: ['pending', 'awaiting_approval'] } }).populate('user', 'name email').sort({ createdAt: -1 }).limit(10);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        newUsersToday,
        activeUsersToday,
        totalTrades,
        totalVolume: volume,
        pendingWithdrawals,
        pendingDeposits,
        openChats
      },
      recentUsers,
      recentTrades,
      recentWithdrawals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/users', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status, kycStatus, sort = '-createdAt' } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status === 'verified') query.isVerified = true;
    if (status === 'unverified') query.isVerified = false;
    if (status === 'locked') query.lockUntil = { $gt: Date.now() };
    if (kycStatus) query.kycStatus = kycStatus;
    
    const users = await User.find(query)
      .select('-password -twoFactorSecret -verificationToken -resetPasswordToken')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/users/:id', protect, authorize('admin'), validateObjectId(), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -twoFactorSecret');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const [trades, withdrawals, deposits, chats, transactions] = await Promise.all([
      Trade.find({ user: user._id }).sort({ createdAt: -1 }).limit(20),
      Withdrawal.find({ user: user._id }).sort({ createdAt: -1 }).limit(20),
      Deposit.find({ user: user._id }).sort({ createdAt: -1 }).limit(20),
      ChatSession.find({ user: user._id }).sort({ createdAt: -1 }).limit(10),
      Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(50)
    ]);
    
    res.json({ success: true, user, trades, withdrawals, deposits, chats, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/users/:id', protect, authorize('admin'), validateObjectId(), logAudit('USER_UPDATE', 'User'), async (req, res) => {
  try {
    const { name, role, isVerified, kycStatus, balances, twoFactorEnabled } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    if (kycStatus) user.kycStatus = kycStatus;
    if (typeof twoFactorEnabled === 'boolean') user.twoFactorEnabled = twoFactorEnabled;
    if (balances) user.balances = balances;
    
    await user.save({ validateBeforeSave: false });
    
    websocketService.broadcastToUser(user._id, 'account:updated', { user: { id: user._id, name: user.name, role: user.role, isVerified: user.isVerified, balances: user.balances } });
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/users/:id/balance', protect, authorize('admin'), validateObjectId(), logAudit('BALANCE_ADJUST', 'User'), async (req, res) => {
  try {
    const { currency, amount, type } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let balance = user.balances.find(b => b.currency === currency.toUpperCase());
    if (!balance) {
      balance = { currency: currency.toUpperCase(), available: 0, locked: 0 };
      user.balances.push(balance);
    }
    
    if (type === 'add') {
      balance.available += amount;
    } else if (type === 'subtract') {
      if (balance.available < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance' });
      }
      balance.available -= amount;
    } else if (type === 'set') {
      balance.available = amount;
    }
    
    await user.save({ validateBeforeSave: false });
    
    await Transaction.create({
      user: user._id,
      type: type === 'add' ? 'bonus' : 'refund',
      currency: currency.toUpperCase(),
      amount,
      netAmount: amount,
      status: 'completed',
      description: `Admin ${type} balance`,
      processedAt: new Date(),
      completedAt: new Date()
    });
    
    websocketService.broadcastToUser(user._id, 'balance:updated', { currency, available: balance.available });
    
    res.json({ success: true, balance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/users/:id', protect, authorize('admin'), validateObjectId(), logAudit('USER_DELETE', 'User'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/withdrawals', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, currency, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (currency) query.currency = currency.toUpperCase();
    if (search) query.$or = [{ address: { $regex: search, $options: 'i' } }, { txHash: { $regex: search, $options: 'i' } }];
    
    const withdrawals = await Withdrawal.find(query)
      .populate('user', 'name email')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Withdrawal.countDocuments(query);
    
    res.json({ success: true, withdrawals, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/withdrawals/:id', protect, authorize('admin'), validateObjectId(), logAudit('WITHDRAWAL_UPDATE', 'Withdrawal'), async (req, res) => {
  try {
    const { status, rejectionReason, adminNotes, priority } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id).populate('user');
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }
    
    const oldStatus = withdrawal.status;
    withdrawal.status = status;
    withdrawal.priority = priority || withdrawal.priority;
    withdrawal.rejectionReason = rejectionReason;
    withdrawal.adminNotes = adminNotes;
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    
    if (status === 'completed') {
      withdrawal.completedAt = new Date();
      withdrawal.txHash = withdrawal.txHash || `tx_${crypto.randomBytes(16).toString('hex')}`;
    }
    
    if (status === 'rejected' || status === 'cancelled') {
      const user = withdrawal.user;
      const balance = user.balances.find(b => b.currency === withdrawal.currency);
      if (balance) {
        balance.locked -= withdrawal.amount;
        balance.available += withdrawal.amount;
        await user.save({ validateBeforeSave: false });
      }
    }
    
    await withdrawal.save();
    
    websocketService.broadcastToUser(withdrawal.user._id, 'withdrawal:updated', {
      withdrawal: { id: withdrawal._id, status: withdrawal.status, txHash: withdrawal.txHash }
    });
    
    res.json({ success: true, withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/deposits', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, currency, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (currency) query.currency = currency.toUpperCase();
    if (search) query.$or = [{ txHash: { $regex: search, $options: 'i' } }, { address: { $regex: search, $options: 'i' } }];
    
    const deposits = await Deposit.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Deposit.countDocuments(query);
    
    res.json({ success: true, deposits, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/deposits/:id', protect, authorize('admin'), validateObjectId(), logAudit('DEPOSIT_UPDATE', 'Deposit'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const deposit = await Deposit.findById(req.params.id).populate('user');
    if (!deposit) {
      return res.status(404).json({ success: false, message: 'Deposit not found' });
    }
    
    const oldStatus = deposit.status;
    deposit.status = status;
    deposit.adminNotes = adminNotes;
    deposit.processedAt = new Date();
    
    if (status === 'completed' && oldStatus !== 'completed') {
      deposit.completedAt = new Date();
      const user = deposit.user;
      let balance = user.balances.find(b => b.currency === deposit.currency);
      if (!balance) {
        balance = { currency: deposit.currency, available: 0, locked: 0 };
        user.balances.push(balance);
      }
      balance.available += deposit.netAmount;
      await user.save({ validateBeforeSave: false });
      
      await Transaction.create({
        user: user._id,
        type: 'deposit',
        currency: deposit.currency,
        amount: deposit.amount,
        fee: deposit.fee,
        netAmount: deposit.netAmount,
        status: 'completed',
        description: `Deposit ${deposit.amount} ${deposit.currency}`,
        reference: deposit.txHash,
        txHash: deposit.txHash,
        address: deposit.address,
        network: deposit.network,
        processedAt: new Date(),
        completedAt: new Date()
      });
      
      websocketService.broadcastToUser(user._id, 'deposit:completed', { depositId: deposit._id, currency: deposit.currency, amount: deposit.netAmount });
    }
    
    await deposit.save();
    
    res.json({ success: true, deposit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/trades', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, pair, userId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (pair) query.pair = pair.toUpperCase();
    if (userId) query.user = userId;
    
    const trades = await Trade.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Trade.countDocuments(query);
    
    res.json({ success: true, trades, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/chats', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, assigned } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assigned === 'me') query.admin = req.user._id;
    if (assigned === 'unassigned') query.admin = { $exists: false };
    
    const sessions = await ChatSession.find(query)
      .populate('user', 'name email')
      .populate('admin', 'name')
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await ChatSession.countDocuments(query);
    
    res.json({ success: true, sessions, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/chats/:id/assign', protect, authorize('admin'), validateObjectId(), logAudit('CHAT_ASSIGN', 'ChatSession'), async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    session.admin = req.user._id;
    session.status = 'active';
    await session.save({ validateBeforeSave: false });
    
    websocketService.io.to(`chat:${session._id}`).emit('chat:admin_joined', { adminId: req.user._id, adminName: req.user.name });
    websocketService.broadcastToUser(session.user, 'chat:admin_assigned', { sessionId: session._id, adminName: req.user.name });
    
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/chats/:id/messages', protect, authorize('admin'), validateObjectId(), validateChatMessage, async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    const message = await ChatMessage.create({
      user: session.user,
      admin: req.user._id,
      message: req.body.message,
      sender: 'admin',
      status: 'sent'
    });
    
    session.lastMessageAt = new Date();
    session.lastMessageBy = 'admin';
    session.unreadCount.user += 1;
    await session.save({ validateBeforeSave: false });
    
    websocketService.io.to(`chat:${session._id}`).emit('chat:message', {
      sessionId: session._id,
      message: { id: message._id, message: message.message, sender: 'admin', createdAt: message.createdAt }
    });
    
    websocketService.broadcastToUser(session.user, 'chat:new_message', { sessionId: session._id, message: message.message, sender: 'admin' });
    
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/chats/:id/close', protect, authorize('admin'), validateObjectId(), logAudit('CHAT_CLOSE', 'ChatSession'), async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    session.status = 'closed';
    session.closedAt = new Date();
    session.closedBy = req.user._id;
    await session.save({ validateBeforeSave: false });
    
    websocketService.io.to(`chat:${session._id}`).emit('chat:closed', { sessionId: session._id });
    
    res.json({ success: true, message: 'Chat closed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await Setting.find().sort({ category: 1, key: 1 });
    const grouped = settings.reduce((acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    }, {});
    
    res.json({ success: true, settings: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/settings/:key', protect, authorize('admin'), logAudit('SETTING_UPDATE', 'Setting'), async (req, res) => {
  try {
    const { value } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({ success: true, setting });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/audit-logs', protect, authorize('admin'), validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, admin, action, resource, severity } = req.query;
    const query = {};
    if (admin) query.admin = admin;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (severity) query.severity = severity;
    
    const logs = await AuditLog.find(query)
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await AuditLog.countDocuments(query);
    
    res.json({ success: true, logs, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const stats = await SiteStats.find({ date: { $gte: startDate } }).sort({ date: 1 });
    
    const [usersByDay, tradesByDay, volumeByDay] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Trade.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Trade.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: 'filled' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, volume: { $sum: { $multiply: ['$filled', '$price'] } } } },
        { $sort: { _id: 1 } }
      ])
    ]);
    
    res.json({ success: true, stats, usersByDay, tradesByDay, volumeByDay });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/maintenance', protect, authorize('admin'), async (req, res) => {
  try {
    const { enabled, message } = req.body;
    
    await Setting.findOneAndUpdate(
      { key: 'maintenance_mode' },
      { value: { enabled, message }, category: 'general' },
      { upsert: true, new: true }
    );
    
    websocketService.broadcastToAll('maintenance:update', { enabled, message });
    
    res.json({ success: true, message: 'Maintenance mode updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;