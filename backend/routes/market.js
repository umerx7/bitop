const express = require('express');
const router = express.Router();
const coingeckoService = require('../services/coingecko');
const { protect, optionalAuth } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

const popularSymbols = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'DOT', 'AVAX', 'LINK', 'UNI', 'LTC', 'BCH', 'ATOM', 'NEAR', 'FTM', 'ALGO', 'VET', 'FIL'];

router.get('/tickers', optionalAuth, async (req, res) => {
  try {
    const prices = await coingeckoService.getPrices(popularSymbols);
    const formatted = coingeckoService.formatPriceData(prices, popularSymbols);
    
    const tickers = Object.entries(formatted).map(([symbol, data]) => ({
      symbol: `${symbol}USDT`,
      baseCurrency: symbol,
      quoteCurrency: 'USDT',
      price: data.price,
      change24h: data.change24h,
      volume24h: data.volume24h,
      high24h: data.price * (1 + Math.abs(data.change24h) / 100),
      low24h: data.price * (1 - Math.abs(data.change24h) / 100),
      lastUpdated: data.lastUpdated
    }));
    
    res.json({ success: true, tickers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/ticker/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const baseSymbol = symbol.replace('USDT', '').replace('BTC', '').replace('ETH', '');
    
    const prices = await coingeckoService.getPrices([baseSymbol]);
    const formatted = coingeckoService.formatPriceData(prices, [baseSymbol]);
    const data = formatted[baseSymbol.toUpperCase()];
    
    if (!data) {
      return res.status(404).json({ success: false, message: 'Symbol not found' });
    }
    
    const marketData = await coingeckoService.getMarketData([baseSymbol]);
    const coinDetails = marketData[0];
    
    res.json({
      success: true,
      ticker: {
        symbol: `${baseSymbol}USDT`,
        baseCurrency: baseSymbol,
        quoteCurrency: 'USDT',
        price: data.price,
        change24h: data.change24h,
        volume24h: data.volume24h,
        high24h: coinDetails?.high_24h || data.price * 1.05,
        low24h: coinDetails?.low_24h || data.price * 0.95,
        marketCap: coinDetails?.market_cap || 0,
        circulatingSupply: coinDetails?.circulating_supply || 0,
        lastUpdated: data.lastUpdated
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/candles/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 200 } = req.query;
    const baseSymbol = symbol.replace('USDT', '').replace('BTC', '').replace('ETH', '');
    
    const daysMap = { '1m': 1, '5m': 1, '15m': 1, '30m': 1, '1h': 1, '4h': 7, '1d': 30, '1w': 90 };
    const days = daysMap[interval] || 1;
    
    const chartData = await coingeckoService.getMarketChart(baseSymbol, days);
    const ohlcData = await coingeckoService.getOHLC(baseSymbol, days);
    
    let candles = [];
    if (ohlcData && ohlcData.length > 0) {
      candles = ohlcData.map(c => ({
        timestamp: c[0],
        open: c[1],
        high: c[2],
        low: c[3],
        close: c[4]
      })).slice(-parseInt(limit));
    } else if (chartData && chartData.prices) {
      candles = chartData.prices.map((p, i) => {
        const next = chartData.prices[i + 1] || p;
        return {
          timestamp: p[0],
          open: p[1],
          high: Math.max(p[1], next[1]),
          low: Math.min(p[1], next[1]),
          close: next[1]
        };
      }).slice(-parseInt(limit));
    }
    
    res.json({ success: true, candles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/orderbook/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 20 } = req.query;
    const baseSymbol = symbol.replace('USDT', '').replace('BTC', '').replace('ETH', '');
    
    const prices = await coingeckoService.getPrices([baseSymbol]);
    const formatted = coingeckoService.formatPriceData(prices, [baseSymbol]);
    const price = formatted[baseSymbol.toUpperCase()]?.price || 0;
    
    const spread = price * 0.001;
    const bids = [];
    const asks = [];
    
    for (let i = 0; i < limit; i++) {
      const bidPrice = price - spread * (i + 1) * 0.1;
      const askPrice = price + spread * (i + 1) * 0.1;
      const amount = Math.random() * 10 + 0.1;
      
      bids.push({ price: parseFloat(bidPrice.toFixed(8)), amount: parseFloat(amount.toFixed(8)), total: parseFloat((bidPrice * amount).toFixed(2)) });
      asks.push({ price: parseFloat(askPrice.toFixed(8)), amount: parseFloat(amount.toFixed(8)), total: parseFloat((askPrice * amount).toFixed(2)) });
    }
    
    res.json({ success: true, orderbook: { bids, asks, timestamp: Date.now() } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/trades/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 50 } = req.query;
    const baseSymbol = symbol.replace('USDT', '').replace('BTC', '').replace('ETH', '');
    
    const prices = await coingeckoService.getPrices([baseSymbol]);
    const formatted = coingeckoService.formatPriceData(prices, [baseSymbol]);
    const price = formatted[baseSymbol.toUpperCase()]?.price || 0;
    
    const trades = [];
    for (let i = 0; i < limit; i++) {
      const isBuy = Math.random() > 0.5;
      const tradePrice = price * (1 + (Math.random() - 0.5) * 0.002);
      const amount = Math.random() * 5 + 0.01;
      
      trades.push({
        id: `trade_${Date.now()}_${i}`,
        price: parseFloat(tradePrice.toFixed(8)),
        amount: parseFloat(amount.toFixed(8)),
        side: isBuy ? 'buy' : 'sell',
        timestamp: Date.now() - i * 1000
      });
    }
    
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/global', optionalAuth, async (req, res) => {
  try {
    const global = await coingeckoService.getGlobalData();
    res.json({ success: true, global: global.data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/trending', optionalAuth, async (req, res) => {
  try {
    const trending = await coingeckoService.getTrending();
    const coins = trending.coins?.map(c => ({
      symbol: c.item.symbol.toUpperCase(),
      name: c.item.name,
      price: c.item.price_btc,
      change24h: c.item.price_change_percentage_24h?.usd || 0,
      marketCapRank: c.item.market_cap_rank
    })) || [];
    
    res.json({ success: true, trending: coins });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/exchange-rates', optionalAuth, async (req, res) => {
  try {
    const rates = await coingeckoService.getExchangeRates();
    res.json({ success: true, rates: rates.rates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, results: [] });
    }
    
    const coins = await coingeckoService.getSupportedCoins();
    const results = coins
      .filter(c => c.symbol.toLowerCase().includes(q.toLowerCase()) || c.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 10)
      .map(c => ({ symbol: c.symbol.toUpperCase(), name: c.name, id: c.id }));
    
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;