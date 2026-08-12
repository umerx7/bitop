const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'trade', 'fee', 'referral', 'bonus', 'refund', 'fiat_deposit', 'fiat_withdrawal'],
    required: true
  },
  method: {
    type: String,
    enum: ['crypto', 'card', 'bank_wire', 'internal'],
    required: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
  },
  fiatCurrency: {
    type: String,
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
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'rejected', 'awaiting_approval', 'awaiting_payment'],
    default: 'pending'
  },
  description: String,
  reference: String,
  txHash: String,
  address: String,
  tag: String,
  network: String,
  metadata: mongoose.Schema.Types.Mixed,
  cardDetails: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  bankDetails: {
    bankName: String,
    accountHolder: String,
    iban: String,
    swift: String,
    reference: String
  },
  processedAt: Date,
  completedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  adminNotes: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ method: 1, status: 1 });
transactionSchema.index({ reference: 1 });
transactionSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);