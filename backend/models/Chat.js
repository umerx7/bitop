const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  sender: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readAt: Date,
  attachments: [{
    url: String,
    type: String,
    name: String,
    size: Number
  }],
  metadata: {
    userAgent: String,
    ip: String,
    page: String
  }
}, {
  timestamps: true
});

chatMessageSchema.index({ user: 1, createdAt: -1 });
chatMessageSchema.index({ admin: 1, createdAt: -1 });
chatMessageSchema.index({ status: 1 });

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['open', 'waiting', 'active', 'closed', 'archived'],
    default: 'open'
  },
  subject: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'billing', 'verification', 'trading', 'security', 'other'],
    default: 'general'
  },
  tags: [String],
  lastMessageAt: Date,
  lastMessageBy: {
    type: String,
    enum: ['user', 'admin']
  },
  unreadCount: {
    user: { type: Number, default: 0 },
    admin: { type: Number, default: 0 }
  },
  closedAt: Date,
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    feedback: String,
    ratedAt: Date
  }
}, {
  timestamps: true
});

chatSessionSchema.index({ user: 1, status: 1 });
chatSessionSchema.index({ admin: 1, status: 1 });
chatSessionSchema.index({ status: 1, lastMessageAt: -1 });

module.exports = {
  ChatMessage: mongoose.model('ChatMessage', chatMessageSchema),
  ChatSession: mongoose.model('ChatSession', chatSessionSchema)
};