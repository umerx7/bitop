const express = require('express');
const router = express.Router();
const { ChatMessage, ChatSession } = require('../models/Chat');
const { protect, authorize } = require('../middleware/auth');
const { validateChatMessage, validateObjectId, validatePagination } = require('../middleware/validation');
const websocketService = require('../services/websocket');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/chat'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'text/csv'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDF, and text files allowed.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

router.post('/session', protect, async (req, res) => {
  try {
    const { subject, category = 'general', priority = 'medium' } = req.body;
    const user = req.user;
    
    let session = await ChatSession.findOne({ 
      user: user._id, 
      status: { $in: ['open', 'waiting', 'active'] } 
    }).sort({ createdAt: -1 });
    
    if (!session) {
      session = await ChatSession.create({
        user: user._id,
        subject,
        category,
        priority,
        status: 'open'
      });
    }
    
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/sessions', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    
    const sessions = await ChatSession.find(query)
      .populate('admin', 'name')
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await ChatSession.countDocuments(query);
    
    res.json({
      success: true,
      sessions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/sessions/:id', protect, validateObjectId(), async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id })
      .populate('admin', 'name')
      .populate('user', 'name email');
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    const messages = await ChatMessage.find({ user: req.user._id, admin: session.admin })
      .sort({ createdAt: 1 })
      .limit(100);
    
    session.unreadCount.user = 0;
    await session.save({ validateBeforeSave: false });
    
    res.json({ success: true, session, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/sessions/:id/messages', protect, validateObjectId(), validateChatMessage, async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    const message = await ChatMessage.create({
      user: req.user._id,
      admin: session.admin,
      message: req.body.message,
      sender: 'user',
      status: 'sent',
      metadata: {
        userAgent: req.get('user-agent'),
        ip: req.ip,
        page: req.body.page || 'chat'
      }
    });
    
    session.lastMessageAt = new Date();
    session.lastMessageBy = 'user';
    session.unreadCount.admin += 1;
    session.status = 'active';
    await session.save({ validateBeforeSave: false });
    
    websocketService.io.to(`chat:${session._id}`).emit('chat:message', {
      sessionId: session._id,
      message: {
        id: message._id,
        message: message.message,
        sender: 'user',
        createdAt: message.createdAt
      }
    });
    
    if (session.admin) {
      websocketService.broadcastToUser(session.admin, 'chat:new_message', {
        sessionId: session._id,
        message: message.message,
        sender: 'user'
      });
    }
    
    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/sessions/:id/read', protect, validateObjectId(), async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    await ChatMessage.updateMany(
      { user: req.user._id, admin: session.admin, sender: 'admin', status: { $ne: 'read' } },
      { status: 'read', readAt: new Date() }
    );
    
    session.unreadCount.user = 0;
    await session.save({ validateBeforeSave: false });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/sessions/:id/rate', protect, validateObjectId(), async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    if (session.status !== 'closed') {
      return res.status(400).json({ success: false, message: 'Can only rate closed sessions' });
    }
    
    session.rating = { score, feedback, ratedAt: new Date() };
    await session.save({ validateBeforeSave: false });
    
    res.json({ success: true, message: 'Thank you for your feedback' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/sessions/:id', protect, validateObjectId(), async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    session.status = 'closed';
    session.closedAt = new Date();
    session.closedBy = req.user._id;
    await session.save({ validateBeforeSave: false });
    
    websocketService.io.to(`chat:${session._id}`).emit('chat:closed', { sessionId: session._id });
    
    res.json({ success: true, message: 'Chat session closed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/faq', async (req, res) => {
  try {
    const faqs = [
      { category: 'General', questions: [
        { q: 'What is BITOP?', a: 'BITOP is a professional cryptocurrency trading platform offering spot trading, wallet services, and 24/7 customer support.' },
        { q: 'Is BITOP regulated?', a: 'BITOP operates in compliance with applicable regulations and implements industry-standard security measures.' },
        { q: 'Which countries are supported?', a: 'BITOP serves users globally except for restricted jurisdictions. Check our Terms of Service for details.' }
      ]},
      { category: 'Account', questions: [
        { q: 'How do I create an account?', a: 'Click "Sign Up" on the homepage, enter your email and password, then verify your email address.' },
        { q: 'How do I enable 2FA?', a: 'Go to Settings > Security and enable Two-Factor Authentication using Google Authenticator or Authy.' },
        { q: 'I forgot my password', a: 'Click "Forgot Password" on the login page and follow the email instructions to reset.' }
      ]},
      { category: 'Trading', questions: [
        { q: 'What trading pairs are available?', a: 'We offer 20+ major pairs including BTC/USDT, ETH/USDT, BNB/USDT, SOL/USDT and more.' },
        { q: 'What are the trading fees?', a: 'Standard fee is 0.1% per trade. VIP users enjoy reduced fees based on 30-day volume.' },
        { q: 'What order types are supported?', a: 'Market, Limit, and Stop-Limit orders are available.' }
      ]},
      { category: 'Deposits & Withdrawals', questions: [
        { q: 'How long do deposits take?', a: 'Crypto deposits require network confirmations (typically 1-30 minutes depending on the blockchain).' },
        { q: 'What are withdrawal fees?', a: 'Fees vary by currency and network. Check the Withdraw page for current fees.' },
        { q: 'Why is my withdrawal pending?', a: 'Withdrawals require email/2FA verification and may need manual review for large amounts.' }
      ]},
      { category: 'Security', questions: [
        { q: 'How secure is BITOP?', a: 'We use cold storage for 95% of funds, 2FA, withdrawal whitelists, and regular security audits.' },
        { q: 'What is KYC?', a: 'Know Your Customer verification is required for higher limits and fiat transactions.' },
        { q: 'How do I report suspicious activity?', a: 'Contact support immediately via live chat or email security@bitop.com' }
      ]}
    ];
    
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/status', protect, async (req, res) => {
  try {
    const activeSession = await ChatSession.findOne({ 
      user: req.user._id, 
      status: { $in: ['open', 'waiting', 'active'] } 
    }).populate('admin', 'name');
    
    res.json({ 
      success: true, 
      hasActiveSession: !!activeSession,
      session: activeSession ? { id: activeSession._id, status: activeSession.status, admin: activeSession.admin } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;