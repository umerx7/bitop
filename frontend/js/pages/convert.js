export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div style="margin-bottom:32px;">
          <a href="/wallet" data-link class="btn btn-ghost btn-sm" style="margin-bottom:16px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg><span>Back to Wallet</span></a>
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Convert</h1>
          <p style="color:var(--text-secondary);">Instantly swap between cryptocurrencies with zero fees</p>
        </div>

        <div class="card" style="max-width:600px;margin:0 auto;">
          <div class="card-header"><h3 class="card-title">Convert Assets</h3></div>
          <form id="convert-form" style="padding:24px;">
            <div class="grid grid-2" style="gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;margin-bottom:8px;font-size:0.875rem;">From</label>
                <div class="flex-between" style="padding:12px 16px;background:var(--bg-secondary);border:1px solid var(--border-muted);border-radius:var(--radius-md);">
                  <div class="flex-center gap-2">
                    <span class="badge badge-info" id="from-badge" style="font-size:0.625rem;">USDT</span>
                    <span style="font-weight:600;" id="from-name">Tether USD</span>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-family:var(--font-mono);font-weight:600;" id="from-balance">0.00</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);" id="from-balance-usd">≈ $0.00</div>
                  </div>
                </div>
                <input type="hidden" id="from-currency" name="fromCurrency" value="USDT">
              </div>
              <div>
                <label style="display:block;margin-bottom:8px;font-size:0.875rem;">To</label>
                <div class="flex-between" style="padding:12px 16px;background:var(--bg-secondary);border:1px solid var(--border-muted);border-radius:var(--radius-md);">
                  <div class="flex-center gap-2">
                    <span class="badge badge-info" id="to-badge" style="font-size:0.625rem;">BTC</span>
                    <span style="font-weight:600;" id="to-name">Bitcoin</span>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-family:var(--font-mono);font-weight:600;" id="to-balance">0.000000</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);" id="to-balance-usd">≈ $0.00</div>
                  </div>
                </div>
                <input type="hidden" id="to-currency" name="toCurrency" value="BTC">
              </div>
            </div>

            <button type="button" class="btn btn-ghost btn-full" id="swap-btn" style="margin-bottom:24px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 1 1 2.12 9.36L1 14"></path></svg></button>

            <div class="input-group" style="margin-bottom:16px;">
              <label style="display:block;margin-bottom:8px;font-size:0.875rem;">Amount</label>
              <div style="position:relative;">
                <input type="number" id="convert-amount" name="amount" step="0.000001" placeholder="0.00" required style="width:100%;">
                <div class="flex-center gap-1" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);" id="convert-percent-btns"></div>
              </div>
            </div>

            <div style="margin-bottom:24px;padding:16px;background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-md);">
              <div class="flex-between" style="margin-bottom:12px;font-size:0.875rem;">
                <span>You receive</span>
                <span id="convert-receive" style="font-family:var(--font-mono);font-weight:600;font-size:1.125rem;">0.00000000 BTC</span>
              </div>
              <div class="flex-between" style="font-size:0.8125rem;color:var(--text-secondary);">
                <span>Rate</span>
                <span id="convert-rate" style="font-family:var(--font-mono);font-weight:600;">1 USDT = 0.00001482 BTC</span>
              </div>
              <div class="flex-between" style="font-size:0.8125rem;color:var(--text-secondary);margin-top:4px;">
                <span>Fee</span>
                <span id="convert-fee" style="font-family:var(--font-mono);color:var(--gold-primary);">0%</span>
              </div>
              <div class="flex-between" style="font-size:0.8125rem;color:var(--text-secondary);margin-top:4px;">
                <span>Min received (slippage 0.5%)</span>
                <span id="convert-min" style="font-family:var(--font-mono);font-weight:600;">0.00000000 BTC</span>
              </div>
            </div>

            <div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;">
              <label class="flex-center gap-2" style="cursor:pointer;font-size:0.8125rem;"><input type="checkbox" id="convert-auto" checked><span>Auto-refresh rate</span></label>
              <span style="font-size:0.75rem;color:var(--text-muted);" id="rate-timer">Refreshing in 10s</span>
            </div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" id="convert-submit">
              <span class="btn-text">Convert</span>
              <span class="loading" style="display:none;"></span>
            </button>
          </form>
        </div>

        <div class="card" style="margin-top:24px;max-width:600px;margin-left:auto;margin-right:auto;">
          <div class="card-header flex-between"><h3 class="card-title">Recent Conversions</h3><a href="/wallet/history" data-link class="btn btn-ghost btn-sm">View All</a></div>
          <div id="convert-history" style="max-height:300px;overflow-y:auto;"></div>
        </div>
      </div>
    </div>
  `,

  async init() {
    this.balances = {};
    this.prices = { BTC: 67432, ETH: 3456, USDT: 1, USDC: 1, BNB: 567, SOL: 145 };
    this.fromCurrency = 'USDT';
    this.toCurrency = 'BTC';
    this.rateTimer = null;
    
    this.bindEvents();
    await this.loadBalances();
    this.updateUI();
    this.startRateTimer();
    this.loadConvertHistory();
  },

  bindEvents() {
    document.getElementById('swap-btn').addEventListener('click', () => this.swapCurrencies());
    document.getElementById('convert-amount').addEventListener('input', () => this.updateCalculations());
    document.getElementById('convert-form').addEventListener('submit', (e) => this.handleConvert(e));
  },

  async loadBalances() {
    try {
      const response = await fetch('/api/wallet/balances', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        this.balances = data.balances.reduce((acc, b) => ({ ...acc, [b.currency]: b.available }), {});
      }
    } catch (error) {
      console.error('Load balances error:', error);
    }
  },

  swapCurrencies() {
    [this.fromCurrency, this.toCurrency] = [this.toCurrency, this.fromCurrency];
    this.updateUI();
    this.updateCalculations();
  },

  updateUI() {
    document.getElementById('from-currency').value = this.fromCurrency;
    document.getElementById('to-currency').value = this.toCurrency;
    document.getElementById('from-badge').textContent = this.fromCurrency;
    document.getElementById('to-badge').textContent = this.toCurrency;
    
    const names = { BTC: 'Bitcoin', ETH: 'Ethereum', USDT: 'Tether USD', USDC: 'USD Coin', BNB: 'BNB', SOL: 'Solana' };
    document.getElementById('from-name').textContent = names[this.fromCurrency] || this.fromCurrency;
    document.getElementById('to-name').textContent = names[this.toCurrency] || this.toCurrency;

    const fromBal = this.balances[this.fromCurrency] || 0;
    const toBal = this.balances[this.toCurrency] || 0;
    const fromPrice = this.prices[this.fromCurrency] || 1;
    const toPrice = this.prices[this.toCurrency] || 1;

    document.getElementById('from-balance').textContent = fromBal.toLocaleString(undefined, { maximumFractionDigits: 8 });
    document.getElementById('from-balance-usd').textContent = `≈ $${(fromBal * fromPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById('to-balance').textContent = toBal.toLocaleString(undefined, { maximumFractionDigits: 8 });
    document.getElementById('to-balance-usd').textContent = `≈ $${(toBal * toPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const percentBtns = document.getElementById('convert-percent-btns');
    if (fromBal > 0) {
      const percents = [25, 50, 75, 100];
      percentBtns.innerHTML = percents.map(p => `
        <button type="button" class="btn btn-ghost btn-xs" data-pct="${p}" style="padding:2px 6px;font-size:0.625rem;">${p}%</button>
      `).join('');
      
      percentBtns.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          document.getElementById('convert-amount').value = (fromBal * parseInt(btn.dataset.pct) / 100).toFixed(8);
          this.updateCalculations();
        });
      });
    }
  },

  updateCalculations() {
    const amount = parseFloat(document.getElementById('convert-amount').value) || 0;
    const fromPrice = this.prices[this.fromCurrency] || 1;
    const toPrice = this.prices[this.toCurrency] || 1;
    
    const rate = fromPrice / toPrice;
    const receive = amount * rate;
    const minReceive = receive * 0.995;

    document.getElementById('convert-receive').textContent = `${receive.toFixed(8)} ${this.toCurrency}`;
    document.getElementById('convert-rate').textContent = `1 ${this.fromCurrency} = ${rate.toFixed(8)} ${this.toCurrency}`;
    document.getElementById('convert-min').textContent = `${minReceive.toFixed(8)} ${this.toCurrency}`;
  },

  startRateTimer() {
    let countdown = 10;
    this.rateTimer = setInterval(() => {
      countdown--;
      document.getElementById('rate-timer').textContent = `Refreshing in ${countdown}s`;
      if (countdown <= 0) {
        countdown = 10;
        this.refreshRate();
      }
    }, 1000);
  },

  async refreshRate() {
    // In real app, fetch from API
    this.prices.BTC = 67432 + (Math.random() - 0.5) * 100;
    this.prices.ETH = 3456 + (Math.random() - 0.5) * 20;
    this.updateCalculations();
  },

  async handleConvert(e) {
    e.preventDefault();
    
    const btn = document.getElementById('convert-submit');
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');
    const amount = parseFloat(document.getElementById('convert-amount').value);
    
    if (!amount || amount <= 0) {
      this.showToast('Enter an amount', 'error');
      return;
    }

    const fromBal = this.balances[this.fromCurrency] || 0;
    if (amount > fromBal) {
      this.showToast('Insufficient balance', 'error');
      return;
    }

    btn.disabled = true;
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';

    try {
      const response = await fetch('/api/wallet/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fromCurrency: this.fromCurrency, toCurrency: this.toCurrency, amount })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('Conversion successful', 'success');
        document.getElementById('convert-amount').value = '';
        this.updateCalculations();
        this.loadBalances();
        this.updateUI();
        this.loadConvertHistory();
      } else {
        this.showToast(data.message || 'Conversion failed', 'error');
      }
    } catch (error) {
      this.showToast('Network error', 'error');
    } finally {
      btn.disabled = false;
      btnText.style.display = 'inline';
      loading.style.display = 'none';
    }
  },

  async loadConvertHistory() {
    try {
      const response = await fetch('/api/wallet/transactions?type=convert&limit=10', { credentials: 'include' });
      const data = await response.json();

      const container = document.getElementById('convert-history');
      if (data.success && data.transactions.length) {
        container.innerHTML = data.transactions.map(t => `
          <div class="flex-between" style="padding:12px 0;border-bottom:1px solid var(--border-muted);">
            <div class="flex-col gap-1">
              <div class="flex-center gap-2">
                <span class="badge badge-${t.status === 'completed' ? 'success' : 'info'}" style="font-size:0.625rem;">${t.status.toUpperCase()}</span>
                <span style="font-family:var(--font-mono);">${t.fromAmount.toLocaleString()} ${t.fromCurrency} → ${t.toAmount.toLocaleString()} ${t.toCurrency}</span>
              </div>
              <span style="font-size:0.75rem;color:var(--text-muted);">${new Date(t.timestamp).toLocaleString()}</span>
            </div>
            <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-secondary);">Rate: ${t.rate.toFixed(8)}</span>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No recent conversions</p>';
      }
    } catch (error) {
      console.error('Convert history error:', error);
    }
  },

  destroy() {
    if (this.rateTimer) clearInterval(this.rateTimer);
  },

  showToast(message, type) {
    import('./components/toast.js').then(module => {
      module.showToast(message, type);
    });
  }
};