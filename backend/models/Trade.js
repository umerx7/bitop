const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pair: {
    type: String,
    required: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  orderType: {
    type: String,
    enum: ['market', 'limit', 'stop_limit'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  filled: {
    type: Number,
    default: 0
  },
  remaining: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'partial', 'filled', 'cancelled', 'rejected', 'expired'],
    default: 'open'
  },
  fee: {
    type: Number,
    default: 0
  },
  feeCurrency: {
    type: String,
    default: 'USDT'
  },
  stopPrice: Number,
  limitPrice: Number,
  triggeredAt: Date,
  filledAt: Date,
  cancelledAt: Date,
  rejectionReason: String,
  clientOrderId: String
}, {
  timestamps: true
});

tradeSchema.index({ user: 1, createdAt: -1 });
tradeSchema.index({ pair: 1, createdAt: -1 });
tradeSchema.index({ status: 1 });

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'trade', 'fee', 'referral', 'bonus', 'refund'],
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
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  description: String,
  reference: String,
  txHash: String,
  address: String,
  tag: String,
  network: String,
  trade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade'
  },
  metadata: mongoose.Schema.Types.Mixed,
  processedAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ reference: 1 });

const orderBookSchema = new mongoose.Schema({
  pair: {
    type: String,
    required: true,
    uppercase: true
  },
  bids: [{
    price: Number,
    amount: Number,
    total: Number,
    orders: Number
  }],
  asks: [{
    price: Number,
    amount: Number,
    total: Number,
    orders: Number
  }],
  lastUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

orderBookSchema.index({ pair: 1 }, { unique: true });

const priceHistorySchema = new mongoose.Schema({
  pair: {
    type: String,
    required: true,
    uppercase: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  volume: Number,
  trades: Number
}, {
  timestamps: true
});

priceHistorySchema.index({ pair: 1, timestamp: -1 });
priceHistorySchema.index({ pair: 1, timestamp: 1 }, { unique: true });

module.exports = {
  Trade: mongoose.model('Trade', tradeSchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
  OrderBook: mongoose.model('OrderBook', orderBookSchema),
  PriceHistory: mongoose.model('PriceHistory', priceHistorySchema)
};