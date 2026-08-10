export default {
  template: `
    <div class="trade-page" style="padding:0;height:calc(100vh - var(--header-height));display:flex;flex-direction:column;">
      <div class="trade-header" style="padding:12px 24px;border-bottom:1px solid var(--border-muted);background:var(--bg-secondary);">
        <div class="flex-between flex-wrap gap-4" style="align-items:center;">
          <div class="flex-center gap-3">
            <select id="pair-select" class="select" style="min-width:180px;padding:8px 36px 8px 12px;font-weight:600;font-size:0.9375rem;"></select>
            <div class="flex-center gap-1" style="background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-md);padding:2px;">
              <button class="tab-btn btn-sm active" data-tab="spot" style="padding:6px 16px;border-radius:var(--radius-sm);">Spot</button>
              <button class="tab-btn btn-sm" data-tab="futures" style="padding:6px 16px;border-radius:var(--radius-sm);">Futures</button>
            </div>
          </div>
          <div class="flex-center gap-2">
            <div style="display:flex;align-items:center;gap:8px;padding:4px 12px;background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-md);font-size:0.8125rem;">
              <span id="price-change-24h" class="badge badge-success" style="font-size:0.75rem;">+0.00%</span>
              <span style="color:var(--text-secondary);">24h</span>
            </div>
            <button class="btn btn-ghost btn-icon" id="fullscreen-chart" aria-label="Fullscreen chart"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg></button>
          </div>
        </div>
      </div>

      <div class="trade-body" style="flex:1;display:flex;overflow:hidden;">
        <div class="trade-chart-pane" style="flex:2;min-width:0;display:flex;flex-direction:column;">
          <div class="chart-toolbar" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--border-muted);background:var(--bg-secondary);">
            <div class="flex-center gap-1" id="chart-timeframes"></div>
            <div class="flex-center gap-2">
              <button class="btn btn-ghost btn-sm" id="chart-type-candles" title="Candles"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"></path><path d="M18 3v18"></path><path d="M6 3v18"></path></svg></button>
              <button class="btn btn-ghost btn-sm" id="chart-type-line" title="Line"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18h18"></path><path d="M3 12h18"></path><path d="M3 6h18"></path></svg></button>
              <button class="btn btn-ghost btn-sm" id="chart-indicators" title="Indicators"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg></button>
            </div>
          </div>
          <div class="chart-container" style="flex:1;position:relative;min-height:0;" id="chart-container">
            <canvas id="trading-chart"></canvas>
            <div id="chart-crosshair" style="position:absolute;pointer-events:none;display:none;">
              <div style="position:absolute;left:0;right:0;height:1px;background:var(--border-muted);"></div>
              <div style="position:absolute;top:0;bottom:0;width:1px;background:var(--border-muted);"></div>
            </div>
          </div>
        </div>

        <div class="trade-orderbook-pane" style="width:320px;min-width:320px;border-left:1px solid var(--border-muted);display:flex;flex-direction:column;background:var(--bg-secondary);">
          <div style="padding:12px;border-bottom:1px solid var(--border-muted);">
            <div class="flex-between" style="margin-bottom:8px;">
              <span style="font-weight:600;font-size:0.8125rem;">Order Book</span>
              <select id="ob-precision" class="select" style="padding:4px 8px;font-size:0.75rem;min-width:80px;">
                <option value="0">0</option>
                <option value="1">0.1</option>
                <option value="2" selected>0.01</option>
                <option value="3">0.001</option>
              </select>
            </div>
            <div class="grid grid-3" style="gap:4px;font-size:0.6875rem;color:var(--text-muted);">
              <span>Price</span><span style="text-align:center;">Amount</span><span style="text-align:right;">Total</span>
            </div>
          </div>
          <div class="orderbook-asks" style="flex:1;overflow-y:auto;padding:0 12px;" id="orderbook-asks"></div>
          <div class="orderbook-spread" style="padding:8px 12px;border-top:1px solid var(--border-muted);border-bottom:1px solid var(--border-muted);background:var(--bg-card);">
            <div class="flex-between" style="font-size:0.75rem;color:var(--text-secondary);">
              <span>Spread</span><span id="spread-value" style="font-family:var(--font-mono);font-weight:600;">-</span>
            </div>
            <div class="flex-between" style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">
              <span>Mid Price</span><span id="mid-price" style="font-family:var(--font-mono);font-weight:600;">-</span>
            </div>
          </div>
          <div class="orderbook-bids" style="flex:1;overflow-y:auto;padding:0 12px;" id="orderbook-bids"></div>
        </div>

        <div class="trade-form-pane" style="width:380px;min-width:380px;border-left:1px solid var(--border-muted);display:flex;flex-direction:column;background:var(--bg-secondary);">
          <div style="padding:16px;border-bottom:1px solid var(--border-muted);">
            <div class="flex-between" style="margin-bottom:16px;">
              <div class="flex-center gap-2">
                <button class="tab-btn active" data-form-tab="buy" style="flex:1;padding:10px;border-radius:var(--radius-md);font-weight:600;">Buy</button>
                <button class="tab-btn" data-form-tab="sell" style="flex:1;padding:10px;border-radius:var(--radius-md);font-weight:600;">Sell</button>
              </div>
            </div>
            <div class="flex-center gap-1" style="margin-bottom:16px;" id="order-types">
              <button class="tab-btn btn-sm active" data-type="limit" style="padding:6px 16px;">Limit</button>
              <button class="tab-btn btn-sm" data-type="market" style="padding:6px 16px;">Market</button>
              <button class="tab-btn btn-sm" data-type="stop-limit" style="padding:6px 16px;">Stop-Limit</button>
            </div>
          </div>

          <form id="trade-form" style="flex:1;padding:16px;overflow-y:auto;">
            <div id="limit-fields">
              <div class="input-group" style="margin-bottom:16px;">
                <label style="display:block;font-size:0.75rem;color:var(--text-muted);margin-bottom:6px;">Price (USDT)</label>
                <div style="position:relative;">
                  <input type="number" id="order-price" name="price" step="0.01" placeholder="0.00" required style="width:100%;">
                  <div class="flex-center gap-1" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:0.75rem;" id="price-percent-btns"></div>
                </div>
              </div>
            </div>

            <div id="stop-fields" style="display:none;">
              <div class="input-group" style="margin-bottom:16px;">
                <label style="display:block;font-size:0.75rem;color:var(--text-muted);margin-bottom:6px;">Stop Price (USDT)</label>
                <input type="number" id="stop-price" name="stopPrice" step="0.01" placeholder="0.00" required style="width:100%;">
              </div>
              <div class="input-group" style="margin-bottom:16px;">
                <label style="display:block;font-size:0.75rem;color:var(--text-muted);margin-bottom:6px;">Limit Price (USDT)</label>
                <input type="number" id="limit-price" name="limitPrice" step="0.01" placeholder="0.00" required style="width:100%;">
              </div>
            </div>

            <div class="input-group" style="margin-bottom:16px;">
              <label style="display:block;font-size:0.75rem;color:var(--text-muted);margin-bottom:6px;">Amount</label>
              <div style="position:relative;">
                <input type="number" id="order-amount" name="amount" step="0.000001" placeholder="0.000000" required style="width:100%;">
                <div class="flex-center gap-1" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);" id="amount-percent-btns"></div>
              </div>
              <div class="flex-between" style="margin-top:8px;font-size:0.75rem;color:var(--text-muted);">
                <span>Available: <span id="available-balance" style="font-family:var(--font-mono);color:var(--text-secondary);">0.00</span></span>
                <span id="estimated-total" style="font-family:var(--font-mono);font-weight:600;">≈ 0.00 USDT</span>
              </div>
            </div>

            <div style="margin-bottom:16px;padding:12px;background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-md);">
              <div class="flex-between" style="margin-bottom:8px;font-size:0.8125rem;">
                <span>Fee</span><span id="fee-display" style="font-family:var(--font-mono);color:var(--gold-primary);">0.10%</span>
              </div>
              <div class="flex-between" style="font-size:0.8125rem;">
                <span style="font-weight:600;">Total</span>
                <span id="total-display" style="font-family:var(--font-mono);font-weight:700;font-size:1rem;">0.00 USDT</span>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" id="submit-order" style="margin-bottom:12px;">
              <span class="btn-text">Buy</span>
              <span class="loading" style="display:none;"></span>
            </button>

            <button type="button" class="btn btn-secondary btn-full" id="reset-form">Reset</button>
          </form>

          <div style="padding:16px;border-top:1px solid var(--border-muted);">
            <div class="flex-between" style="margin-bottom:12px;font-size:0.8125rem;font-weight:600;">
              <span>Open Orders</span>
              <a href="/trade/history" data-link class="btn btn-ghost btn-sm">History</a>
            </div>
            <div id="open-orders-mini" style="max-height:180px;overflow-y:auto;"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  async init(params) {
    this.currentPair = params[1] || 'BTC/USDT';
    this.currentTab = 'buy';
    this.currentOrderType = 'limit';
    this.chartTimeframe = '1h';
    this.chartType = 'candles';
    this.orderbookPrecision = 2;
    this.priceData = [];
    this.orderbookData = { asks: [], bids: [] };
    this.userBalances = {};

    this.bindEvents();
    await this.loadPairs();
    await this.loadUserBalances();
    this.selectPair(this.currentPair);
    this.initChart();
    this.initOrderbook();
    this.startDataStreams();
  },

  bindEvents() {
    const pairSelect = document.getElementById('pair-select');
    const formTabs = document.querySelectorAll('[data-form-tab]');
    const orderTypeBtns = document.querySelectorAll('[data-type]');
    const timeframeBtns = document.getElementById('chart-timeframes');
    const precisionSelect = document.getElementById('ob-precision');
    const form = document.getElementById('trade-form');
    const resetBtn = document.getElementById('reset-form');
    const priceInput = document.getElementById('order-price');
    const amountInput = document.getElementById('order-amount');

    pairSelect.addEventListener('change', (e) => this.selectPair(e.target.value));
    
    formTabs.forEach(btn => {
      btn.addEventListener('click', () => this.switchFormTab(btn.dataset.formTab));
    });

    orderTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => this.switchOrderType(btn.dataset.type));
    });

    timeframeBtns.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-timeframe]');
      if (btn) this.switchTimeframe(btn.dataset.timeframe);
    });

    precisionSelect.addEventListener('change', (e) => {
      this.orderbookPrecision = parseInt(e.target.value);
      this.renderOrderbook();
    });

    form.addEventListener('submit', (e) => this.handleSubmit(e));
    resetBtn.addEventListener('click', () => this.resetForm());

    priceInput.addEventListener('input', () => this.updateCalculations());
    amountInput.addEventListener('input', () => this.updateCalculations());

    document.getElementById('fullscreen-chart').addEventListener('click', () => this.toggleFullscreen());
  },

  async loadPairs() {
    try {
      const response = await fetch('/api/market/tickers');
      const data = await response.json();
      
      if (data.success) {
        this.pairs = data.tickers.map(t => t.symbol);
        const select = document.getElementById('pair-select');
        select.innerHTML = this.pairs.map(p => `<option value="${p}"${p === this.currentPair ? ' selected' : ''}>${p}</option>`).join('');
      }
    } catch (error) {
      console.error('Load pairs error:', error);
    }
  },

  async loadUserBalances() {
    try {
      const response = await fetch('/api/wallet/balances', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        this.userBalances = data.balances.reduce((acc, b) => ({ ...acc, [b.currency]: b }), {});
        this.updateAvailableBalance();
      }
    } catch (error) {
      console.error('Load balances error:', error);
    }
  },

  selectPair(pair) {
    this.currentPair = pair;
    document.getElementById('pair-select').value = pair;
    this.loadTickerData();
    this.loadOrderbook();
    this.loadPriceHistory();
    this.updateAvailableBalance();
    this.loadOpenOrders();
  },

  switchFormTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('[data-form-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.formTab === tab);
    });
    
    const submitBtn = document.getElementById('submit-order');
    const btnText = submitBtn.querySelector('.btn-text');
    
    if (tab === 'buy') {
      submitBtn.className = 'btn btn-primary btn-full btn-lg';
      btnText.textContent = 'Buy';
    } else {
      submitBtn.className = 'btn btn-danger btn-full btn-lg';
      btnText.textContent = 'Sell';
    }
    
    this.updateAvailableBalance();
    this.updateCalculations();
  },

  switchOrderType(type) {
    this.currentOrderType = type;
    document.querySelectorAll('[data-type]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });

    const limitFields = document.getElementById('limit-fields');
    const stopFields = document.getElementById('stop-fields');
    const priceInput = document.getElementById('order-price');
    const stopPriceInput = document.getElementById('stop-price');
    const limitPriceInput = document.getElementById('limit-price');

    if (type === 'market') {
      limitFields.style.display = 'none';
      stopFields.style.display = 'none';
      priceInput.required = false;
      stopPriceInput.required = false;
      limitPriceInput.required = false;
    } else if (type === 'stop-limit') {
      limitFields.style.display = 'none';
      stopFields.style.display = 'block';
      priceInput.required = false;
      stopPriceInput.required = true;
      limitPriceInput.required = true;
    } else {
      limitFields.style.display = 'block';
      stopFields.style.display = 'none';
      priceInput.required = true;
      stopPriceInput.required = false;
      limitPriceInput.required = false;
    }
    
    this.updateCalculations();
  },

  switchTimeframe(tf) {
    this.chartTimeframe = tf;
    document.querySelectorAll('[data-timeframe]').forEach(btn => {
      btn.classList.toggle('btn-primary', btn.dataset.timeframe === tf);
      btn.classList.toggle('btn-ghost', btn.dataset.timeframe !== tf);
    });
    this.loadPriceHistory();
  },

  async loadTickerData() {
    try {
      const response = await fetch(`/api/market/ticker/${this.currentPair}`);
      const data = await response.json();
      
      if (data.success) {
        const t = data.ticker;
        document.getElementById('price-change-24h').textContent = `${t.change24h >= 0 ? '+' : ''}${t.change24h.toFixed(2)}%`;
        document.getElementById('price-change-24h').className = `badge ${t.change24h >= 0 ? 'badge-success' : 'badge-danger'}`;
        
        this.updatePercentButtons(t.price);
      }
    } catch (error) {
      console.error('Ticker load error:', error);
    }
  },

  updatePercentButtons(price) {
    const pricePercents = document.getElementById('price-percent-btns');
    if (!pricePercents) return;
    
    const percents = [0.99, 0.995, 1, 1.005, 1.01];
    pricePercents.innerHTML = percents.map(p => `
      <button type="button" class="btn btn-ghost btn-xs" data-price="${(price * p).toFixed(2)}" style="padding:2px 6px;font-size:0.625rem;">${(p * 100).toFixed(0)}%</button>
    `).join('');
    
    pricePercents.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('order-price').value = btn.dataset.price;
        this.updateCalculations();
      });
    });
  },

  updateAvailableBalance() {
    const [base, quote] = this.currentPair.split('/');
    const balance = this.currentTab === 'buy' ? this.userBalances[quote] : this.userBalances[base];
    const available = balance?.available || 0;
    document.getElementById('available-balance').textContent = available.toLocaleString(undefined, { maximumFractionDigits: 8 });
    
    const amountPercents = document.getElementById('amount-percent-btns');
    if (amountPercents && available > 0) {
      const percents = [25, 50, 75, 100];
      amountPercents.innerHTML = percents.map(p => `
        <button type="button" class="btn btn-ghost btn-xs" data-pct="${p}" style="padding:2px 6px;font-size:0.625rem;">${p}%</button>
      `).join('');
      
      amountPercents.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const pct = parseInt(btn.dataset.pct) / 100;
          const amount = this.currentTab === 'buy' 
            ? (available * pct) / (parseFloat(document.getElementById('order-price').value) || 1)
            : available * pct;
          document.getElementById('order-amount').value = amount.toFixed(6);
          this.updateCalculations();
        });
      });
    }
  },

  updateCalculations() {
    const price = parseFloat(document.getElementById('order-price').value) || 0;
    const amount = parseFloat(document.getElementById('order-amount').value) || 0;
    const feeRate = 0.001;
    
    let total = 0;
    let fee = 0;
    
    if (this.currentOrderType === 'market') {
      const tickerPrice = this.priceData[this.priceData.length - 1]?.close || price;
      total = amount * tickerPrice;
    } else {
      total = price * amount;
    }
    
    fee = total * feeRate;
    
    document.getElementById('fee-display').textContent = `${(feeRate * 100).toFixed(2)}%`;
    document.getElementById('total-display').textContent = `${total.toFixed(2)} USDT`;
    document.getElementById('estimated-total').textContent = `≈ ${total.toFixed(2)} USDT`;
  },

  resetForm() {
    document.getElementById('trade-form').reset();
    this.updateCalculations();
  },

  async handleSubmit(e) {
    e.preventDefault();
    
    const btn = document.getElementById('submit-order');
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');
    
    const price = parseFloat(document.getElementById('order-price').value);
    const amount = parseFloat(document.getElementById('order-amount').value);
    const stopPrice = parseFloat(document.getElementById('stop-price').value);
    const limitPrice = parseFloat(document.getElementById('limit-price').value);
    
    if ((this.currentOrderType !== 'market' && (!price || price <= 0)) || 
        (this.currentOrderType === 'stop-limit' && (!stopPrice || !limitPrice)) ||
        !amount || amount <= 0) {
      this.showToast('Please fill in all required fields', 'error');
      return;
    }

    btn.disabled = true;
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';

    try {
      const orderData = {
        pair: this.currentPair,
        type: this.currentTab,
        orderType: this.currentOrderType,
        amount
      };

      if (this.currentOrderType !== 'market') orderData.price = price;
      if (this.currentOrderType === 'stop-limit') {
        orderData.stopPrice = stopPrice;
        orderData.limitPrice = limitPrice;
      }

      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        this.showToast(`${this.currentTab.charAt(0).toUpperCase() + this.currentTab.slice(1)} order placed successfully`, 'success');
        this.resetForm();
        this.loadOpenOrders();
        this.loadUserBalances();
      } else {
        this.showToast(data.message || 'Order failed', 'error');
      }
    } catch (error) {
      this.showToast('Network error. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btnText.style.display = 'inline';
      loading.style.display = 'none';
    }
  },

  async loadOrderbook() {
    try {
      const response = await fetch(`/api/market/orderbook/${this.currentPair}?limit=50`);
      const data = await response.json();
      
      if (data.success) {
        this.orderbookData = data.orderbook;
        this.renderOrderbook();
      }
    } catch (error) {
      console.error('Orderbook load error:', error);
    }
  },

  renderOrderbook() {
    const { asks, bids } = this.orderbookData;
    const precision = this.orderbookPrecision;
    const factor = Math.pow(10, precision);
    
    const aggregate = (orders, isAsk) => {
      const map = new Map();
      orders.forEach(o => {
        const key = Math.round(o.price * factor) / factor;
        map.set(key, (map.get(key) || 0) + o.amount);
      });
      return Array.from(map.entries())
        .map(([price, amount]) => ({ price, amount, total: amount * price }))
        .sort((a, b) => isAsk ? a.price - b.price : b.price - a.price);
    };

    const aggAsks = aggregate(asks, true).slice(0, 25).reverse();
    const aggBids = aggregate(bids, false).slice(0, 25);

    const maxAskAmount = Math.max(...aggAsks.map(a => a.amount), 1);
    const maxBidAmount = Math.max(...aggBids.map(b => b.amount), 1);
    const maxAmount = Math.max(maxAskAmount, maxBidAmount);

    document.getElementById('orderbook-asks').innerHTML = aggAsks.map(a => `
      <div class="ob-row ask" style="display:flex;align-items:center;height:22px;font-size:0.75rem;padding:2px 0;">
        <span style="width:45%;text-align:right;padding-right:8px;font-family:var(--font-mono);color:var(--danger);">${a.price.toLocaleString(undefined, {minimumFractionDigits: precision, maximumFractionDigits: precision})}</span>
        <span style="width:30%;text-align:center;font-family:var(--font-mono);">${a.amount.toLocaleString(undefined, {maximumFractionDigits: 4})}</span>
        <div style="width:25%;height:6px;background:linear-gradient(90deg,rgba(239,68,68,0.3),transparent);border-radius:3px;"></div>
      </div>
    `).join('');

    document.getElementById('orderbook-bids').innerHTML = aggBids.map(b => `
      <div class="ob-row bid" style="display:flex;align-items:center;height:22px;font-size:0.75rem;padding:2px 0;">
        <span style="width:45%;text-align:right;padding-right:8px;font-family:var(--font-mono);color:var(--success);">${b.price.toLocaleString(undefined, {minimumFractionDigits: precision, maximumFractionDigits: precision})}</span>
        <span style="width:30%;text-align:center;font-family:var(--font-mono);">${b.amount.toLocaleString(undefined, {maximumFractionDigits: 4})}</span>
        <div style="width:25%;height:6px;background:linear-gradient(90deg,rgba(34,197,94,0.3),transparent);border-radius:3px;"></div>
      </div>
    `).join('');

    if (aggAsks.length && aggBids.length) {
      const bestAsk = aggAsks[aggAsks.length - 1].price;
      const bestBid = aggBids[0].price;
      const spread = ((bestAsk - bestBid) / bestBid * 100).toFixed(2);
      const mid = ((bestAsk + bestBid) / 2).toFixed(precision);
      document.getElementById('spread-value').textContent = `${spread}% (${(bestAsk - bestBid).toFixed(precision)})`;
      document.getElementById('mid-price').textContent = mid;
    }
  },

  initChart() {
    const canvas = document.getElementById('trading-chart');
    const container = document.getElementById('chart-container');
    const dpr = window.devicePixelRatio || 1;
    
    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      this.ctx = canvas.getContext('2d');
      this.ctx.scale(dpr, dpr);
      this.chartWidth = rect.width;
      this.chartHeight = rect.height;
      this.drawChart();
    };
    
    resize();
    window.addEventListener('resize', resize);
    this.resizeChart = resize;
  },

  async loadPriceHistory() {
    try {
      const response = await fetch(`/api/market/klines/${this.currentPair}?interval=${this.chartTimeframe}&limit=200`);
      const data = await response.json();
      
      if (data.success) {
        this.priceData = data.klines.map(k => ({
          time: k.openTime,
          open: k.open,
          high: k.high,
          low: k.low,
          close: k.close,
          volume: k.volume
        }));
        this.drawChart();
      }
    } catch (error) {
      console.error('Price history load error:', error);
    }
  },

  drawChart() {
    if (!this.ctx || !this.priceData.length) return;
    
    const ctx = this.ctx;
    const w = this.chartWidth;
    const h = this.chartHeight;
    const padding = { top: 20, right: 60, bottom: 30, left: 50 };
    const cw = w - padding.left - padding.right;
    const ch = h - padding.top - padding.bottom;
    
    ctx.clearRect(0, 0, w, h);
    
    const prices = this.priceData.map(d => d.close);
    const minPrice = Math.min(...this.priceData.map(d => d.low));
    const maxPrice = Math.max(...this.priceData.map(d => d.high));
    const priceRange = maxPrice - minPrice || 1;
    
    const volMax = Math.max(...this.priceData.map(d => d.volume));
    
    const xScale = i => padding.left + (i / (this.priceData.length - 1)) * cw;
    const yScale = price => padding.top + (1 - (price - minPrice) / priceRange) * ch;
    
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * ch;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const x = padding.left + (i / 5) * cw;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, h - padding.bottom);
      ctx.stroke();
    }
    
    if (this.chartType === 'candles') {
      const candleWidth = Math.max(1, cw / this.priceData.length * 0.6);
      
      this.priceData.forEach((d, i) => {
        const x = xScale(i);
        const color = d.close >= d.open ? '#22c55e' : '#ef4444';
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yScale(d.high));
        ctx.lineTo(x, yScale(d.low));
        ctx.stroke();
        
        ctx.fillStyle = color;
        const bodyTop = yScale(Math.max(d.open, d.close));
        const bodyHeight = Math.max(1, Math.abs(yScale(d.close) - yScale(d.open)));
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    } else {
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.priceData.forEach((d, i) => {
        const x = xScale(i);
        const y = yScale(d.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono"';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const price = maxPrice - (i / 4) * priceRange;
      const y = padding.top + (i / 4) * ch;
      ctx.fillText(price.toLocaleString(undefined, {maximumFractionDigits: 2}), padding.left - 8, y + 3);
    }
    
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const idx = Math.floor((i / 5) * (this.priceData.length - 1));
      const x = xScale(idx);
      const time = new Date(this.priceData[idx].time);
      ctx.fillText(time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}), x, h - padding.bottom + 16);
    }
    
    const lastPrice = this.priceData[this.priceData.length - 1].close;
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 12px "JetBrains Mono"';
    ctx.textAlign = 'left';
    ctx.fillText(lastPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), w - padding.right + 8, yScale(lastPrice) + 4);
  },

  initOrderbook() {
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
    const container = document.getElementById('chart-timeframes');
    container.innerHTML = timeframes.map(tf => `
      <button class="tab-btn btn-xs ${tf === this.chartTimeframe ? 'btn-primary' : 'btn-ghost'}" data-timeframe="${tf}" style="padding:4px 10px;">${tf}</button>
    `).join('');
  },

  async loadOpenOrders() {
    try {
      const response = await fetch('/api/trades/open', { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        const orders = data.trades.filter(t => t.pair === this.currentPair).slice(0, 5);
        const container = document.getElementById('open-orders-mini');
        
        if (orders.length === 0) {
          container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8125rem;text-align:center;padding:16px;">No open orders for this pair</p>';
          return;
        }
        
        container.innerHTML = orders.map(o => `
          <div style="padding:10px;background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-md);margin-bottom:8px;font-size:0.75rem;">
            <div class="flex-between" style="margin-bottom:4px;">
              <span class="badge ${o.type === 'buy' ? 'badge-success' : 'badge-danger'}">${o.type.toUpperCase()} ${o.orderType.toUpperCase()}</span>
              <span style="font-family:var(--font-mono);color:var(--text-secondary);">${o.status}</span>
            </div>
            <div class="flex-between" style="font-family:var(--font-mono);">
              <span>${o.remaining.toFixed(6)} ${this.currentPair.split('/')[0]}</span>
              <span>@ ${o.price.toLocaleString()}</span>
            </div>
            <button class="btn btn-ghost btn-xs btn-danger" style="margin-top:8px;width:100%;" data-cancel="${o._id}">Cancel</button>
          </div>
        `).join('');
        
        container.querySelectorAll('[data-cancel]').forEach(btn => {
          btn.addEventListener('click', () => this.cancelOrder(btn.dataset.cancel));
        });
      }
    } catch (error) {
      console.error('Open orders load error:', error);
    }
  },

  async cancelOrder(id) {
    try {
      const response = await fetch(`/api/trades/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        this.loadOpenOrders();
        this.loadUserBalances();
      }
    } catch (error) {
      console.error('Cancel order error:', error);
    }
  },

  startDataStreams() {
    this.tickerInterval = setInterval(() => this.loadTickerData(), 2000);
    this.orderbookInterval = setInterval(() => this.loadOrderbook(), 1000);
    this.ordersInterval = setInterval(() => this.loadOpenOrders(), 5000);
  },

  destroy() {
    if (this.tickerInterval) clearInterval(this.tickerInterval);
    if (this.orderbookInterval) clearInterval(this.orderbookInterval);
    if (this.ordersInterval) clearInterval(this.ordersInterval);
    if (this.resizeChart) window.removeEventListener('resize', this.resizeChart);
  },

  showToast(message, type) {
    import('./components/toast.js').then(module => {
      module.showToast(message, type);
    });
  }
};