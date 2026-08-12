const express = require('express');
const router = express.Router();
const PublicChatMessage = require('../models/PublicChat');
const { protect, optionalAuth } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');
const websocketService = require('../services/websocket');

const AI_RESPONSES = {
  greeting: [
    "Hello! Welcome to BITOP Community Chat! 👋 How can I help you today?",
    "Hi there! I'm your BITOP AI assistant. What's on your mind?",
    "Welcome! Ask me anything about trading, markets, or BITOP features!"
  ],
  trading: [
    "For trading, check out our Spot Trading page with 20+ pairs like BTC/USDT, ETH/USDT, SOL/USDT. Fees start at 0.1%! 📈",
    "You can trade Market, Limit, and Stop-Limit orders. Pro tip: Use limit orders to save on fees! 💡",
    "Our matching engine handles 1M+ orders/second with 0.4ms latency. Perfect for high-frequency trading! ⚡"
  ],
  deposit: [
    "Deposits require network confirmations - usually 1-30 mins depending on the blockchain. Check the Wallet page for deposit addresses! 💰",
    "We support 20+ networks for deposits. Always double-check the network matches your withdrawal source! 🔗"
  ],
  withdrawal: [
    "Withdrawal fees vary by currency/network. Large amounts may need manual review. Enable 2FA for faster processing! 🔐",
    "You can whitelist withdrawal addresses in Settings > Security for extra protection! 🛡️"
  ],
  kyc: [
    "KYC unlocks higher limits and fiat trading. Level 1: Basic info, Level 2: ID + selfie, Level 3: Proof of address. 📋",
    "Verification usually takes 5-15 minutes. Our automated system reviews most applications instantly! ✅"
  ],
  security: [
    "Security tips: Enable 2FA, use withdrawal whitelist, never share passwords/API keys. We use 95% cold storage! 🔒",
    "BITOP is SOC 2 Type II certified. Your funds are protected by multi-sig vaults and regular pen testing! 🏦"
  ],
  referral: [
    "Referral program: Earn 20% of trading fees from referrals! Share your link from the Referral page. 🤝",
    "Your referrals get 10% fee discount for 30 days. You earn lifetime commissions! 💰"
  ],
  api: [
    "API access: Pro plan gets 100 req/s, Institutional gets unlimited. Create keys in Settings > API! 🔧",
    "We support REST and WebSocket APIs. Check /api-docs for full documentation! 📚"
  ],
  fees: [
    "Trading fees: Starter 0.1%, Pro 0.05%, Institutional as low as 0.01% based on volume! 📊",
    "No deposit fees. Withdrawal fees vary by network. Check the Fees page for current rates! 💸"
  ],
  default: [
    "I'm here to help with BITOP questions! Try asking about trading, deposits, KYC, security, or referrals.",
    "Not sure what you need? Check our FAQ at /faq or try: 'How do I deposit?', 'Trading fees?', 'Enable 2FA?'"
  ]
};

function getAiResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  
  if (msg.match(/\b(hi|hello|hey|welcome|start)\b/)) return AI_RESPONSES.greeting;
  if (msg.match(/\b(trade|trading|buy|sell|order|market|limit|spot)\b/)) return AI_RESPONSES.trading;
  if (msg.match(/\b(deposit|fund|add money|send crypto)\b/)) return AI_RESPONSES.deposit;
  if (msg.match(/\b(withdraw|withdrawal|cash out|take out)\b/)) return AI_RESPONSES.withdrawal;
  if (msg.match(/\b(kyc|verify|verification|identity|document)\b/)) return AI_RESPONSES.kyc;
  if (msg.match(/\b(security|2fa|two factor|auth|password|hack|safe)\b/)) return AI_RESPONSES.security;
  if (msg.match(/\b(referral|refer|invite|affiliate|commission)\b/)) return AI_RESPONSES.referral;
  if (msg.match(/\b(api|webhook|rest|websocket|key)\b/)) return AI_RESPONSES.api;
  if (msg.match(/\b(fee|fees|cost|price|charge)\b/)) return AI_RESPONSES.fees;
  
  return AI_RESPONSES.default;
}

router.get('/messages', optionalAuth, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await PublicChatMessage.find()
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    
    const total = await PublicChatMessage.countDocuments();
    
    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get public messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/messages', protect, async (req, res) => {
  try {
    const { message, parentMessage } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }
    
    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message too long (max 2000 chars)' });
    }
    
    const userMessage = await PublicChatMessage.create({
      user: req.user._id,
      message: message.trim(),
      sender: 'user'
    });
    
    await userMessage.populate('user', 'name avatar');
    
    websocketService.io.to('public-chat').emit('public-chat:message', {
      message: {
        id: userMessage._id,
        user: userMessage.user,
        message: userMessage.message,
        sender: 'user',
        createdAt: userMessage.createdAt
      }
    });
    
    setTimeout(async () => {
      try {
        const responses = getAiResponse(message);
        const aiResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const aiMessage = await PublicChatMessage.create({
          user: req.user._id,
          message: aiResponse,
          sender: 'ai',
          isAiResponse: true,
          parentMessage: userMessage._id
        });
        
        await aiMessage.populate('user', 'name avatar');
        
        websocketService.io.to('public-chat').emit('public-chat:message', {
          message: {
            id: aiMessage._id,
            user: aiMessage.user,
            message: aiMessage.message,
            sender: 'ai',
            isAiResponse: true,
            createdAt: aiMessage.createdAt
          }
        });
      } catch (err) {
        console.error('AI response error:', err);
      }
    }, 1000 + Math.random() * 2000);
    
    res.status(201).json({ success: true, message: userMessage });
  } catch (error) {
    console.error('Send public message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/users-online', protect, async (req, res) => {
  try {
    const onlineUsers = await PublicChatMessage.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } } },
      { $group: { _id: '$user', lastSeen: { $max: '$createdAt' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: '$user._id', name: '$user.name', avatar: '$user.avatar', lastSeen: 1 } }
    ]);
    
    res.json({ success: true, users: onlineUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;