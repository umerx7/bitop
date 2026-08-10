const express = require('express');
const router = express.Router();
const { Trade, Transaction, OrderBook, PriceHistory } = require('../models/Trade');
const { protect, authorize } = require('../middleware/auth');
const { validateTrade, validateObjectId, validatePagination } = require('../middleware/validation');
const coingeckoService = require('../services/coingecko');
const websocketService = require('../services/websocket');
const User = require('../models/User');
const { Withdrawal, Deposit } = require('../models/Wallet');

router.get('/pairs', async (req, res) => {
  try {
    const pairs = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
      'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'AVAXUSDT',
      'LINKUSDT', 'UNIUSDT', 'LTCUSDT', 'BCHUSDT', 'ATOMUSDT',
      'NEARUSDT', 'FTMUSDT', 'ALGOUSDT', 'VETUSDT', 'FILUSDT'
    ];
    res.json({ success: true, pairs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/orderbook/:pair', async (req, res) => {
  try {
    const { pair } = req.params;
    const { limit = 50 } = req.query;
    
    let orderBook = await OrderBook.findOne({ pair: pair.toUpperCase() });
    
    if (!orderBook) {
      orderBook = { bids: [], asks: [], lastUpdate: new Date() };
    }
    
    res.json({
      success: true,
      orderbook: {
        bids: orderBook.bids.slice(0, limit).map(b => ({ price: b.price, amount: b.amount, total: b.total })),
        asks: orderBook.asks.slice(0, limit).map(a => ({ price: a.price, amount: a.amount, total: a.total })),
        lastUpdate: orderBook.lastUpdate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/history/:pair', validatePagination, async (req, res) => {
  try {
    const { pair } = req.params;
    const { limit = 100, interval = '1h' } = req.query;
    
    const history = await PriceHistory.find({ pair: pair.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, history: history.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/', protect, validateTrade, async (req, res) => {
  try {
    const { pair, type, orderType, amount, price, stopPrice, limitPrice } = req.body;
    const user = req.user;
    
    const symbols = pair.replace('USDT', '').replace('BTC', '').replace('ETH', '');
    const baseCurrency = pair.replace('USDT', '').replace('BTC', '').replace('ETH', '');
    const quoteCurrency = pair.includes('USDT') ? 'USDT' : (pair.includes('BTC') ? 'BTC' : 'ETH');
    
    const marketData = await coingeckoService.getPrices([baseCurrency]);
    const currentPrice = marketData[baseCurrency.toUpperCase()]?.price || price;
    
    const executionPrice = orderType === 'market' ? currentPrice : price;
    const totalCost = amount * executionPrice;
    const fee = totalCost * 0.001;
    const totalWithFee = type === 'buy' ? totalCost + fee : totalCost - fee;
    
    const balance = user.balances.find(b => b.currency === quoteCurrency);
    const availableBalance = balance ? balance.available : 0;
    
    if (type === 'buy' && availableBalance < totalWithFee) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }
    
    if (type === 'sell') {
      const baseBalance = user.balances.find(b => b.currency === baseCurrency);
      if (!baseBalance || baseBalance.available < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance' });
      }
    }
    
    const trade = await Trade.create({
      user: user._id,
      pair: pair.toUpperCase(),
      type,
      orderType,
      amount,
      price: executionPrice,
      remaining: amount,
      fee,
      feeCurrency: quoteCurrency,
      stopPrice,
      limitPrice,
      clientOrderId: `BITOP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    
    if (type === 'buy') {
      balance.available -= totalWithFee;
      balance.locked += totalWithFee;
    } else {
      const baseBalance = user.balances.find(b => b.currency === baseCurrency);
      baseBalance.available -= amount;
      baseBalance.locked += amount;
    }
    await user.save({ validateBeforeSave: false });
    
    if (orderType === 'market') {
      trade.status = 'filled';
      trade.filled = amount;
      trade.remaining = 0;
      trade.filledAt = new Date();
      
      if (type === 'buy') {
        balance.locked -= totalWithFee;
        const receivedBalance = user.balances.find(b => b.currency === baseCurrency) || { currency: baseCurrency, available: 0, locked: 0 };
        receivedBalance.available += amount;
        if (!user.balances.some(b => b.currency === baseCurrency)) {
          user.balances.push(receivedBalance);
        }
      } else {
        const baseBalance = user.balances.find(b => b.currency === baseCurrency);
        baseBalance.locked -= amount;
        balance.available += totalWithFee;
      }
      await user.save({ validateBeforeSave: false });
      
      await Transaction.create({
        user: user._id,
        type: 'trade',
        currency: quoteCurrency,
        amount: totalCost,
        fee,
        netAmount: totalWithFee,
        status: 'completed',
        description: `${type.toUpperCase()} ${amount} ${baseCurrency} at ${executionPrice} ${quoteCurrency}`,
        trade: trade._id,
        processedAt: new Date(),
        completedAt: new Date()
      });
    }
    
    await trade.save();
    
    websocketService.broadcastToUser(user._id, 'trade:update', {
      trade: {
        id: trade._id,
        pair: trade.pair,
        type: trade.type,
        orderType: trade.orderType,
        amount: trade.amount,
        price: trade.price,
        filled: trade.filled,
        remaining: trade.remaining,
        status: trade.status,
        fee: trade.fee,
        createdAt: trade.createdAt
      }
    });
    
    res.status(201).json({ success: true, trade });
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/', protect, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, pair, type, sort = 'desc' } = req.query;
    const user = req.user;
    
    const query = { user: user._id };
    if (status) query.status = status;
    if (pair) query.pair = pair.toUpperCase();
    if (type) query.type = type;
    
    const trades = await Trade.find(query)
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Trade.countDocuments(query);
    
    res.json({
      success: true,
      trades,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/open', protect, async (req, res) => {
  try {
    const trades = await Trade.find({ 
      user: req.user._id, 
      status: { $in: ['open', 'partial'] } 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id', protect, validateObjectId(), async (req, res) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, user: req.user._id });
    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }
    res.json({ success: true, trade });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/:id', protect, validateObjectId(), async (req, res) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, user: req.user._id });
    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }
    
    if (!['open', 'partial'].includes(trade.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel filled or cancelled order' });
    }
    
    const user = req.user;
    const baseCurrency = trade.pair.replace('USDT', '').replace('BTC', '').replace('ETH', '');
    const quoteCurrency = trade.pair.includes('USDT') ? 'USDT' : (trade.pair.includes('BTC') ? 'BTC' : 'ETH');
    const executionPrice = trade.price;
    const totalCost = trade.remaining * executionPrice;
    const fee = totalCost * 0.001;
    const totalWithFee = trade.type === 'buy' ? totalCost + fee : totalCost - fee;
    
    if (trade.type === 'buy') {
      const quoteBalance = user.balances.find(b => b.currency === quoteCurrency);
      quoteBalance.locked -= totalWithFee;
      quoteBalance.available += totalWithFee;
    } else {
      const baseBalance = user.balances.find(b => b.currency === baseCurrency);
      baseBalance.locked -= trade.remaining;
      baseBalance.available += trade.remaining;
    }
    await user.save({ validateBeforeSave: false });
    
    trade.status = 'cancelled';
    trade.cancelledAt = new Date();
    trade.remaining = 0;
    await trade.save();
    
    websocketService.broadcastToUser(user._id, 'trade:cancelled', { tradeId: trade._id });
    
    res.json({ success: true, message: 'Order cancelled successfully', trade });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/stats/summary', protect, async (req, res) => {
  try {
    const user = req.user;
    const trades = await Trade.find({ user: user._id });
    
    const stats = {
      totalTrades: trades.length,
      filledTrades: trades.filter(t => t.status === 'filled').length,
      cancelledTrades: trades.filter(t => t.status === 'cancelled').length,
      totalVolume: trades.reduce((sum, t) => sum + (t.filled * t.price), 0),
      totalFees: trades.reduce((sum, t) => sum + t.fee, 0),
      winRate: 0,
      pnl: 0
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;