const axios = require('axios');

const COINGECKO_API = process.env.COINGECKO_API || 'https://api.coingecko.com/api/v3';

const coinIdMap = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  USDC: 'usd-coin',
  BNB: 'binancecoin',
  SOL: 'solana',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  MATIC: 'polygon',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  UNI: 'uniswap',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  ATOM: 'cosmos',
  NEAR: 'near',
  FTM: 'fantom',
  ALGO: 'algorand',
  VET: 'vechain',
  FIL: 'filecoin',
  TRX: 'tron',
  ETC: 'ethereum-classic',
  XLM: 'stellar',
  THETA: 'theta-token',
  XMR: 'monero',
  EOS: 'eos',
  AAVE: 'aave',
  GRT: 'the-graph',
  CRV: 'curve-dao-token',
  MKR: 'maker',
  SNX: 'synthetix-network-token',
  COMP: 'compound',
  YFI: 'yearn-finance',
  SUSHI: 'sushi',
  RUNE: 'thorchain',
  LUNA: 'terra-luna-2',
  UST: 'terrausd',
  CRO: 'crypto-com-chain',
  KSM: 'kusama',
  ZEC: 'zcash',
  DASH: 'dash',
  XTZ: 'tezos',
  ENJ: 'enjin-coin',
  BAT: 'basic-attention-token',
  MANA: 'decentraland',
  SAND: 'the-sandbox',
  AXS: 'axie-infinity',
  GALA: 'gala',
  CHZ: 'chiliz',
  HOT: 'holo',
  ZIL: 'zilliqa',
  ICX: 'icon',
  ONT: 'ontology',
  QTUM: 'qtum',
  ZRX: '0x',
  BNT: 'bancor',
  OMG: 'omisego',
  REP: 'augur',
  KNC: 'kyber-network-crystal',
  LRC: 'loopring',
  BAND: 'band-protocol',
  REN: 'republic-protocol',
  BAL: 'balancer',
  NMR: 'numeraire',
  STORJ: 'storj',
  ANT: 'aragon',
  MLN: 'enzyme',
  CVC: 'civic',
  DNT: 'district0x',
  POWR: 'power-ledger',
  RCN: 'ripio-credit-network',
  SALT: 'salt',
  WINGS: 'wings',
  DATA: 'streamr',
  PAY: 'tenx',
  GNO: 'gnosis',
  CDT: 'coindash',
  FUN: 'funfair',
  GUP: 'matchpool',
  HST: 'horizon-state',
  MCO: 'monaco',
  WTC: 'waltonchain',
  MOD: 'modum',
  WAX: 'wax',
  POE: 'poet',
  QASH: 'qash',
  QSP: 'quantstamp',
  REQ: 'request-network',
  RLC: 'iexec-rlc',
  SNGLS: 'singulardtv',
  SNT: 'status',
  SPANK: 'spankchain',
  STORM: 'storm',
  SUB: 'substratum',
  TKN: 'tokencard',
  TRST: 'trust',
  VIA: 'viacoin',
  WINGS: 'wings',
  XRL: 'xaurum',
  ZSC: 'zeusshield',
  GOLD: 'pax-gold',
  SILVER: 'tether-gold'
};

const reverseCoinIdMap = {};
Object.entries(coinIdMap).forEach(([symbol, id]) => {
  reverseCoinIdMap[id] = symbol;
});

class CoinGeckoService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000;
  }

  getCoinId(symbol) {
    return coinIdMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  getSymbol(coinId) {
    return reverseCoinIdMap[coinId] || coinId.toUpperCase();
  }

  async fetchWithCache(key, fetchFn) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  async getPrices(symbols, vsCurrency = 'usd') {
    const ids = symbols.map(s => this.getCoinId(s)).join(',');
    return this.fetchWithCache(`prices_${ids}_${vsCurrency}`, async () => {
      const response = await axios.get(`${COINGECKO_API}/simple/price`, {
        params: {
          ids,
          vs_currencies: vsCurrency,
          include_24hr_change: true,
          include_24hr_vol: true,
          include_last_updated_at: true
        },
        timeout: 10000
      });
      return response.data;
    });
  }

  async getMarketData(symbols, vsCurrency = 'usd') {
    const ids = symbols.map(s => this.getCoinId(s)).join(',');
    return this.fetchWithCache(`market_${ids}_${vsCurrency}`, async () => {
      const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: vsCurrency,
          ids,
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: false,
          price_change_percentage: '1h,24h,7d'
        },
        timeout: 10000
      });
      return response.data;
    });
  }

  async getCoinDetails(symbol) {
    const id = this.getCoinId(symbol);
    return this.fetchWithCache(`coin_${id}`, async () => {
      const response = await axios.get(`${COINGECKO_API}/coins/${id}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false
        },
        timeout: 10000
      });
      return response.data;
    });
  }

  async getOHLC(symbol, days = 1, vsCurrency = 'usd') {
    const id = this.getCoinId(symbol);
    return this.fetchWithCache(`ohlc_${id}_${days}_${vsCurrency}`, async () => {
      const response = await axios.get(`${COINGECKO_API}/coins/${id}/ohlc`, {
        params: {
          vs_currency: vsCurrency,
          days
        },
        timeout: 10000
      });
      return response.data;
    });
  }

  async getMarketChart(symbol, days = 1, vsCurrency = 'usd') {
    const id = this.getCoinId(symbol);
    return this.fetchWithCache(`chart_${id}_${days}_${vsCurrency}`, async () => {
      const response = await axios.get(`${COINGECKO_API}/coins/${id}/market_chart`, {
        params: {
          vs_currency: vsCurrency,
          days,
          interval: days <= 1 ? 'hourly' : 'daily'
        },
        timeout: 10000
      });
      return response.data;
    });
  }

  async getTrending() {
    return this.fetchWithCache('trending', async () => {
      const response = await axios.get(`${COINGECKO_API}/search/trending`, {
        timeout: 10000
      });
      return response.data;
    });
  }

  async getGlobalData() {
    return this.fetchWithCache('global', async () => {
      const response = await axios.get(`${COINGECKO_API}/global`, {
        timeout: 10000
      });
      return response.data;
    });
  }

  async getExchangeRates() {
    return this.fetchWithCache('exchange_rates', async () => {
      const response = await axios.get(`${COINGECKO_API}/exchange_rates`, {
        timeout: 10000
      });
      return response.data;
    });
  }

  async getSupportedCoins() {
    return this.fetchWithCache('coins_list', async () => {
      const response = await axios.get(`${COINGECKO_API}/coins/list`, {
        timeout: 10000
      });
      return response.data;
    });
  }

  formatPriceData(rawData, symbols, vsCurrency = 'usd') {
    const result = {};
    symbols.forEach(symbol => {
      const id = this.getCoinId(symbol);
      const data = rawData[id];
      if (data) {
        result[symbol.toUpperCase()] = {
          price: data[vsCurrency] || 0,
          change24h: data[`${vsCurrency}_24h_change`] || 0,
          volume24h: data[`${vsCurrency}_24h_vol`] || 0,
          lastUpdated: data.last_updated_at || Date.now() / 1000
        };
      }
    });
    return result;
  }

  formatMarketData(rawData) {
    return rawData.map(coin => ({
      symbol: this.getSymbol(coin.id),
      id: coin.id,
      name: coin.name,
      image: coin.image,
      price: coin.current_price,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      change1h: coin.price_change_percentage_1h_in_currency || 0,
      change24h: coin.price_change_percentage_24h_in_currency || 0,
      change7d: coin.price_change_percentage_7d_in_currency || 0,
      circulatingSupply: coin.circulating_supply,
      totalSupply: coin.total_supply,
      maxSupply: coin.max_supply,
      ath: coin.ath,
      athChange: coin.ath_change_percentage,
      atl: coin.atl,
      atlChange: coin.atl_change_percentage,
      lastUpdated: coin.last_updated
    }));
  }
}

module.exports = new CoinGeckoService();