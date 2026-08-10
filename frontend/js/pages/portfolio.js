export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div style="margin-bottom:24px;">
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Portfolio</h1>
          <p style="color:var(--text-secondary);">Track your holdings and performance</p>
        </div>

        <div class="grid grid-4" style="gap:20px;margin-bottom:24px;" id="portfolio-summary"></div>

        <div class="grid" style="grid-template-columns:2fr 1fr;gap:24px;">
          <div class="card">
            <div class="card-header flex-between">
              <h3 class="card-title">Portfolio Value</h3>
              <div class="flex-center gap-1">
                <button class="btn btn-ghost btn-sm active" data-period="24h" style="padding:6px 12px;">24h</button>
                <button class="btn btn-ghost btn-sm" data-period="7d" style="padding:6px 12px;">7d</button>
                <button class="btn btn-ghost btn-sm" data-period="30d" style="padding:6px 12px;">30d</button>
                <button class="btn btn-ghost btn-sm" data-period="all" style="padding:6px 12px;">All</button>
              </div>
            </div>
            <div style="height:350px;position:relative;" id="portfolio-chart"></div>
          </div>

          <div class="card" style="height:350px;display:flex;flex-direction:column;">
            <div class="card-header flex-between">
              <h3 class="card-title">Asset Allocation</h3>
            </div>
            <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;" id="allocation-chart"></div>
            <div id="allocation-legend" style="padding:16px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;"></div>
          </div>
        </div>

        <div class="card" style="margin-top:24px;">
          <div class="card-header flex-between">
            <h3 class="card-title">Holdings</h3>
            <div class="flex-center gap-2">
              <select id="holdings-sort" class="select" style="min-width:140px;padding:6px 10px;font-size:0.8125rem;">
                <option value="value">Sort by Value</option>
                <option value="change">Sort by 24h Change</option>
                <option value="amount">Sort by Amount</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
          <div class="table-wrapper" id="holdings-table"></div>
        </div>

        <div class="grid grid-2" style="gap:24px;margin-top:24px;">
          <div class="card">
            <div class="card-header flex-between">
              <h3 class="card-title">Performance</h3>
            </div>
            <div id="performance-metrics" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;padding:16px;"></div>
          </div>

          <div class="card">
            <div class="card-header flex-between">
              <h3 class="card-title">Recent Transactions</h3>
              <a href="/wallet/history" data-link class="btn btn-ghost btn-sm">View All</a>
            </div>
            <div id="recent-transactions" style="max-height:300px;overflow-y:auto;"></div>
          </div>
        </div>
      </div>
    </div>
  `,

  async init() {
    this.currentPeriod = '7d';
    this.holdings = [];
    this.priceCache = {};
    
    this.bindEvents();
    await this.loadPortfolioData();
    this.initCharts();
    this.startAutoRefresh();
  },

  bindEvents() {
    document.querySelectorAll('[data-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentPeriod = btn.dataset.period;
        this.updatePortfolioChart();
      });
    });

    document.getElementById('holdings-sort').addEventListener('change', (e) => {
      this.sortHoldings(e.target.value);
      this.renderHoldingsTable();
    });
  },

  async loadPortfolioData() {
    try {
      const [balancesRes, tickersRes, activityRes] = await Promise.all([
        fetch('/api/wallet/balances', { credentials: 'include' }),
        fetch('/api/market/tickers', { credentials: 'include' }),
        fetch('/api/user/activity?limit=20', { credentials: 'include' })
      ]);

      const [balancesData, tickersData, activityData] = await Promise.all([
        balancesRes.json(), tickersRes.json(), activityRes.json()
      ]);

      if (balancesData.success) {
        this.balances = balancesData.balances;
      }

      if (tickersData.success) {
        this.priceCache = {};
        tickersData.tickers.forEach(t => {
          this.priceCache[t.baseCurrency] = t.price;
          this.priceCache[t.symbol] = t.price;
        });
      }

      this.processHoldings();
      this.renderSummary();
      this.renderHoldingsTable();
      this.renderAllocationChart();
      this.updatePortfolioChart();

      if (activityData.success) {
        this.renderTransactions(activityData.activities);
      }
    } catch (error) {
      console.error('Portfolio load error:', error);
    }
  },

  processHoldings() {
    this.holdings = this.balances
      .filter(b => b.available + b.locked > 0)
      .map(b => {
        const price = this.priceCache[b.currency] || 1;
        const total = (b.available + b.locked) * price;
        const change24h = this.get24hChange(b.currency);
        return {
          currency: b.currency,
          available: b.available,
          locked: b.locked,
          total: b.available + b.locked,
          price,
          value: total,
          change24h,
          changeValue: total * (change24h / 100)
        };
      })
      .sort((a, b) => b.value - a.value);
  },

  get24hChange(currency) {
    return (Math.random() - 0.45) * 10;
  },

  renderSummary() {
    const totalValue = this.holdings.reduce((sum, h) => sum + h.value, 0);
    const totalChange24h = this.holdings.reduce((sum, h) => sum + h.changeValue, 0);
    const changePct = totalValue > 0 ? (totalChange24h / (totalValue - totalChange24h)) * 100 : 0;

    const cards = [
      { label: 'Total Value', value: '$' + totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), change: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`, positive: changePct >= 0, icon: '💰' },
      { label: '24h Change', value: `${totalChange24h >= 0 ? '+' : ''}$${Math.abs(totalChange24h).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, change: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`, positive: totalChange24h >= 0, icon: '📈' },
      { label: 'Assets', value: this.holdings.length.toString(), change: 'Different coins', positive: null, icon: '🪙' },
      { label: 'Available', value: '$' + this.holdings.reduce((sum, h) => sum + h.available * h.price, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), change: 'Ready to trade', positive: null, icon: '✅' }
    ];

    document.getElementById('portfolio-summary').innerHTML = cards.map(c => `
      <div class="card">
        <div class="flex-between">
          <span style="color:var(--text-secondary);font-size:0.875rem;">${c.label}</span>
          <span style="font-size:1.5rem;">${c.icon}</span>
        </div>
        <div style="margin-top:12px;">
          <div style="font-size:1.5rem;font-weight:700;font-family:var(--font-mono);">${c.value}</div>
          <div class="badge ${c.positive === true ? 'badge-success' : c.positive === false ? 'badge-danger' : 'badge-info'}" style="margin-top:8px;font-size:0.75rem;">${c.change}</div>
        </div>
      </div>
    `).join('');
  },

  renderHoldingsTable() {
    const table = document.getElementById('holdings-table');
    
    if (this.holdings.length === 0) {
      table.innerHTML = `
        <div style="padding:60px;text-align:center;color:var(--text-muted);">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 16px;opacity:0.5;"><path d="M21 12V7H5"></path><path d="M3 21h18"></path><path d="M5 7l3 3 8-8"></path></svg>
          <p style="font-size:1.125rem;margin-bottom:8px;">No holdings yet</p>
          <p style="font-size:0.875rem;">Start trading to build your portfolio</p>
          <a href="/trade" data-link class="btn btn-primary" style="margin-top:16px;">Go to Trade</a>
        </div>
      `;
      return;
    }

    table.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Amount</th>
            <th>Price</th>
            <th>Value</th>
            <th>24h Change</th>
            <th>Allocation</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${this.holdings.map(h => {
            const totalValue = this.holdings.reduce((sum, h) => sum + h.value, 0);
            const allocation = totalValue > 0 ? (h.value / totalValue * 100).toFixed(2) : 0;
            return `
              <tr>
                <td>
                  <div class="flex-center gap-2">
                    <span class="badge badge-info" style="font-size:0.625rem;padding:2px 6px;">${h.currency}</span>
                    <span style="font-weight:600;">${h.currency}</span>
                  </div>
                </td>
                <td style="font-family:var(--font-mono);">${h.total.toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                <td style="font-family:var(--font-mono);">$${h.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: h.price < 1 ? 6 : 2 })}</td>
                <td style="font-family:var(--font-mono);font-weight:600;">$${h.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>
                  <span class="badge ${h.change24h >= 0 ? 'badge-success' : 'badge-danger'}">${h.change24h >= 0 ? '+' : ''}${h.change24h.toFixed(2)}%</span>
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="flex:1;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                      <div style="width:${allocation}%;height:100%;background:linear-gradient(135deg,var(--accent-primary),var(--gold-primary));border-radius:3px;transition:width 0.3s;"></div>
                    </div>
                    <span style="font-size:0.75rem;font-family:var(--font-mono);color:var(--text-secondary);min-width:45px;">${allocation}%</span>
                  </div>
                </td>
                <td>
                  <div class="flex-center gap-1">
                    <a href="/trade?pair=${h.currency}/USDT" data-link class="btn btn-ghost btn-xs" title="Trade">📈</a>
                    <a href="/wallet?currency=${h.currency}" data-link class="btn btn-ghost btn-xs" title="Wallet">💼</a>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  },

  sortHoldings(key) {
    switch (key) {
      case 'value': this.holdings.sort((a, b) => b.value - a.value); break;
      case 'change': this.holdings.sort((a, b) => b.change24h - a.change24h); break;
      case 'amount': this.holdings.sort((a, b) => b.total - a.total); break;
      case 'name': this.holdings.sort((a, b) => a.currency.localeCompare(b.currency)); break;
    }
  },

  renderAllocationChart() {
    const container = document.getElementById('allocation-chart');
    const legend = document.getElementById('allocation-legend');
    
    const totalValue = this.holdings.reduce((sum, h) => sum + h.value, 0);
    
    if (totalValue === 0) {
      container.innerHTML = '<p style="color:var(--text-muted);">No assets to display</p>';
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 280;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const centerX = 140, centerY = 140, radius = 90;
    let currentAngle = -Math.PI / 2;

    const colors = {
      BTC: '#f7931a', ETH: '#627eea', USDT: '#26a17b', USDC: '#2775ca',
      BNB: '#f3ba2f', SOL: '#00ffa3', XRP: '#23292f', ADA: '#0033ad',
      DOGE: '#c2a633', MATIC: '#8247e5', DOT: '#e6007a', AVAX: '#e84142'
    };

    this.holdings.slice(0, 8).forEach((h, i) => {
      const sliceAngle = (h.value / totalValue) * Math.PI * 2;
      const color = colors[h.currency] || `hsl(${i * 45}, 70%, 50%)`;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      currentAngle += sliceAngle;
    });

    if (this.holdings.length > 8) {
      const othersValue = this.holdings.slice(8).reduce((sum, h) => sum + h.value, 0);
      const sliceAngle = (othersValue / totalValue) * Math.PI * 2;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = '#64748b';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 55, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0e17';
    ctx.fill();

    ctx.font = 'bold 18px "JetBrains Mono"';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('$' + (totalValue / 1000).toFixed(1) + 'K', centerX, centerY + 6);

    legend.innerHTML = this.holdings.slice(0, 8).map((h, i) => {
      const color = colors[h.currency] || `hsl(${i * 45}, 70%, 50%)`;
      const allocation = ((h.value / totalValue) * 100).toFixed(1);
      return `
        <div class="flex-center gap-2" style="font-size:0.8125rem;">
          <span style="width:12px;height:12px;border-radius:2px;background:${color};"></span>
          <span>${h.currency} ${allocation}%</span>
        </div>
      `;
    }).join('');

    if (this.holdings.length > 8) {
      const othersValue = this.holdings.slice(8).reduce((sum, h) => sum + h.value, 0);
      const allocation = ((othersValue / totalValue) * 100).toFixed(1);
      legend.innerHTML += `
        <div class="flex-center gap-2" style="font-size:0.8125rem;">
          <span style="width:12px;height:12px;border-radius:2px;background:#64748b;"></span>
          <span>Others ${allocation}%</span>
        </div>
      `;
    }
  },

  initCharts() {
    this.initPortfolioChart();
  },

  initPortfolioChart() {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    document.getElementById('portfolio-chart').appendChild(canvas);
    this.portfolioCanvas = canvas;
  },

  updatePortfolioChart() {
    const ctx = this.portfolioCanvas.getContext('2d');
    const rect = this.portfolioCanvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.portfolioCanvas.width = rect.width * dpr;
    this.portfolioCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const periods = { '24h': 24, '7d': 7 * 24, '30d': 30 * 24, 'all': 365 * 24 };
    const points = periods[this.currentPeriod] || 168;
    
    const totalValue = this.holdings.reduce((sum, h) => sum + h.value, 0);
    const data = [];
    let base = totalValue || 10000;
    
    for (let i = 0; i < points; i++) {
      base += (Math.random() - 0.48) * (totalValue * 0.02);
      data.push(Math.max(base, totalValue * 0.5));
    }

    const padding = 20;
    const w = rect.width - padding * 2;
    const h = rect.height - padding * 2;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const grad = ctx.createLinearGradient(0, padding, 0, rect.height - padding);
    grad.addColorStop(0, 'rgba(0, 212, 255, 0.25)');
    grad.addColorStop(1, 'rgba(0, 212, 255, 0)');

    ctx.beginPath();
    ctx.moveTo(padding, rect.height - padding - (data[0] - min) / range * h);
    for (let i = 1; i < points; i++) {
      const x = padding + (i / (points - 1)) * w;
      const y = rect.height - padding - (data[i] - min) / range * h;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(padding + w, rect.height - padding);
    ctx.lineTo(padding, rect.height - padding);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(padding, rect.height - padding - (data[0] - min) / range * h);
    for (let i = 1; i < points; i++) {
      const x = padding + (i / (points - 1)) * w;
      const y = rect.height - padding - (data[i] - min) / range * h;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.stroke();
  },

  renderTransactions(activities) {
    const container = document.getElementById('recent-transactions');
    
    if (!activities.length) {
      container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No recent transactions</p>';
      return;
    }

    container.innerHTML = activities.map(a => `
      <div class="flex-between" style="padding:12px 0;border-bottom:1px solid var(--border-muted);">
        <div class="flex-col gap-1">
          <span style="font-weight:500;">${a.action}</span>
          <span style="font-size:0.75rem;color:var(--text-muted);">${new Date(a.timestamp).toLocaleString()}</span>
        </div>
        <span style="font-family:var(--font-mono);font-weight:600;color:${a.amount >= 0 ? 'var(--success)' : 'var(--danger)'};">
          ${a.amount >= 0 ? '+' : ''}$${Math.abs(a.amount).toLocaleString()}
        </span>
      </div>
    `).join('');
  },

  startAutoRefresh() {
    this.refreshInterval = setInterval(() => this.loadPortfolioData(), 30000);
  },

  destroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }
};