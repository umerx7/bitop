const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: mongoose.Schema.Types.Mixed,
  category: {
    type: String,
    enum: ['general', 'trading', 'fees', 'security', 'email', 'sms', 'api', 'maintenance', 'kyc', 'referral'],
    required: true
  },
  description: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    default: 'string'
  },
  validation: {
    min: Number,
    max: Number,
    enum: [String],
    regex: String
  }
}, {
  timestamps: true
});

const siteStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  totalUsers: Number,
  newUsers: Number,
  activeUsers: Number,
  totalTrades: Number,
  totalVolume: Number,
  totalDeposits: Number,
  totalWithdrawals: Number,
  revenue: Number,
  topPairs: [{
    pair: String,
    volume: Number,
    trades: Number
  }]
}, {
  timestamps: true
});

siteStatsSchema.index({ date: -1 }, { unique: true });

const auditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  }
}, {
  timestamps: true
});

auditLogSchema.index({ admin: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = {
  Setting: mongoose.model('Setting', settingSchema),
  SiteStats: mongoose.model('SiteStats', siteStatsSchema),
  AuditLog: mongoose.model('AuditLog', auditLogSchema)
};