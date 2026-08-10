const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
  },
  amount: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  tag: String,
  network: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'rejected', 'awaiting_approval'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'instant'],
    default: 'normal'
  },
  txHash: String,
  confirmations: {
    type: Number,
    default: 0
  },
  requiredConfirmations: {
    type: Number,
    default: 1
  },
  rejectionReason: String,
  adminNotes: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  completedAt: Date,
  twoFactorVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpire: Date,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

withdrawalSchema.index({ user: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: 1 });
withdrawalSchema.index({ txHash: 1 });

const depositSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
  },
  amount: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  network: {
    type: String,
    required: true
  },
  address: String,
  tag: String,
  txHash: {
    type: String,
    required: true
  },
  confirmations: {
    type: Number,
    default: 0
  },
  requiredConfirmations: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'awaiting_confirmation'],
    default: 'pending'
  },
  fromAddress: String,
  blockNumber: Number,
  blockHash: String,
  processedAt: Date,
  completedAt: Date,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

depositSchema.index({ user: 1, createdAt: -1 });
depositSchema.index({ txHash: 1 }, { unique: true, sparse: true });
depositSchema.index({ status: 1, createdAt: 1 });
depositSchema.index({ currency: 1, network: 1 });

const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['bank_transfer', 'credit_card', 'debit_card', 'crypto', 'ewallet'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  details: mongoose.Schema.Types.Mixed,
  isDefault: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  lastUsed: Date
}, {
  timestamps: true
});

paymentMethodSchema.index({ user: 1, type: 1 });

module.exports = {
  Withdrawal: mongoose.model('Withdrawal', withdrawalSchema),
  Deposit: mongoose.model('Deposit', depositSchema),
  PaymentMethod: mongoose.model('PaymentMethod', paymentMethodSchema)
};