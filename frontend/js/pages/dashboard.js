export default {
  template: `
    <div class="dashboard-page" style="padding:32px 0;">
      <div class="container">
        <div style="margin-bottom:32px;">
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Dashboard</h1>
          <p style="color:var(--text-secondary);">Welcome back, <span id="dash-user-name"></span>. Here's your portfolio overview.</p>
        </div>

        <div class="grid grid-4" style="gap:20px;margin-bottom:32px;" id="portfolio-cards"></div>

        <div class="grid" style="grid-template-columns:2fr 1fr;gap:24px;" id="dashboard-grid">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Portfolio Value</h3>
              <div class="flex-center gap-2">
                <button class="btn btn-ghost btn-sm" data-period="24h">24h</button>
                <button class="btn btn-ghost btn-sm btn-primary" data-period="7d">7d</button>
                <button class="btn btn-ghost btn-sm" data-period="30d">30d</button>
                <button class="btn btn-ghost btn-sm" data-period="all">All</button>
              </div>
            </div>
            <div style="height:300px;position:relative;" id="portfolio-chart"></div>
          </div>

          <div class="card" style="height:300px;">
            <div class="card-header">
              <h3 class="card-title">Recent Activity</h3>
            </div>
            <div id="recent-activity" style="max-height:240px;overflow-y:auto;"></div>
          </div>
        </div>

        <div class="grid grid-2" style="gap:24px;margin-top:24px;">
          <div class="card">
            <div class="card-header flex-between">
              <h3 class="card-title">Open Orders</h3>
              <a href="/trade" data-link class="btn btn-ghost btn-sm">View All</a>
            </div>
            <div class="table-wrapper" id="open-orders-table"></div>
          </div>

          <div class="card">
            <div class="card-header flex-between">
              <h3 class="card-title">Market Movers</h3>
              <a href="/markets" data-link class="btn btn-ghost btn-sm">View All</a>
            </div>
            <div class="table-wrapper" id="movers-table"></div>
          </div>
        </div>

        <div class="card" style="margin-top:24px;">
          <div class="card-header flex-between">
            <h3 class="card-title">Asset Allocation</h3>
            <a href="/portfolio" data-link class="btn btn-ghost btn-sm">View Details</a>
          </div>
          <div id="allocation-chart" style="height:250px;display:flex;align-items:center;justify-content:center;"></div>
        </div>
      </div>
    </div>
  `,

  async init() {
    this.bindPeriodButtons();
    await this.loadDashboardData();
    this.initCharts();
  },

  bindPeriodButtons() {
    document.querySelectorAll('[data-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('btn-primary'));
        btn.classList.add('btn-primary');
        this.updatePortfolioChart(btn.dataset.period);
      });
    });
  },

  async loadDashboardData() {
    try {
      const [userRes, balancesRes, tradesRes, marketRes] = await Promise.all([
        fetch('/api/auth/me', { credentials: 'include' }),
        fetch('/api/wallet/balances', { credentials: 'include' }),
        fetch('/api/trades/open', { credentials: 'include' }),
        fetch('/api/market/tickers', { credentials: 'include' })
      ]);

      const [userData, balancesData, tradesData, marketData] = await Promise.all([
        userRes.json(), balancesRes.json(), tradesRes.json(), marketRes.json()
      ]);

      if (userData.success) {
        document.getElementById('dash-user-name').textContent = userData.user.name;
        this.user = userData.user;
      }

      if (balancesData.success) {
        this.renderPortfolioCards(balancesData.balances);
        this.balances = balancesData.balances;
      }

      if (tradesData.success) {
        this.renderOpenOrders(tradesData.trades);
      }

      if (marketData.success) {
        this.renderMovers(marketData.tickers);
      }

      this.loadActivity();
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  },

  renderPortfolioCards(balances) {
    const usdt = balances.find(b => b.currency === 'USDT');
    const btc = balances.find(b => b.currency === 'BTC');
    const eth = balances.find(b => b.currency === 'ETH');
    
    let totalValue = 0;
    const prices = { BTC: 67432, ETH: 3456, USDT: 1 };
    
    balances.forEach(b => {
      totalValue += (b.available + b.locked) * (prices[b.currency] || 1);
    });

    const cards = [
      { label: 'Total Balance', value: '$' + totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), change: '+2.34%', positive: true, icon: '$' },
      { label: 'Available', value: '$' + (usdt?.available || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), change: 'Ready to trade', positive: null, icon: '💰' },
      { label: 'In Orders', value: '$' + (usdt?.locked || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), change: 'Locked in open orders', positive: null, icon: '🔒' },
      { label: '24h P&L', value: '+$1,234.56', change: '+2.34%', positive: true, icon: '📈' }
    ];

    document.getElementById('portfolio-cards').innerHTML = cards.map(c => `
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

  renderOpenOrders(trades) {
    if (trades.length === 0) {
      document.getElementById('open-orders-table').innerHTML = `
        <div style="padding:40px;text-align:center;color:var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 16px;opacity:0.5;"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 9h6v6"></path></svg>
          <p>No open orders</p>
          <a href="/trade" data-link class="btn btn-primary btn-sm" style="margin-top:16px;">Start Trading</a>
        </div>
      `;
      return;
    }

    document.getElementById('open-orders-table').innerHTML = `
      <table>
        <thead>
          <tr><th>Pair</th><th>Type</th><th>Amount</th><th>Price</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          ${trades.slice(0, 5).map(t => `
            <tr>
              <td style="font-weight:600;">${t.pair}</td>
              <td><span class="badge ${t.type === 'buy' ? 'badge-success' : 'badge-danger'}">${t.type.toUpperCase()}</span></td>
              <td style="font-family:var(--font-mono);">${t.remaining.toFixed(6)}</td>
              <td style="font-family:var(--font-mono);">$${t.price.toLocaleString()}</td>
              <td><span class="badge badge-info">${t.status.toUpperCase()}</span></td>
              <td><button class="btn btn-ghost btn-sm btn-danger" data-cancel="${t._id}">Cancel</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.querySelectorAll('[data-cancel]').forEach(btn => {
      btn.addEventListener('click', () => this.cancelOrder(btn.dataset.cancel));
    });
  },

  renderMovers(tickers) {
    const gainers = [...tickers].sort((a, b) => b.change24h - a.change24h).slice(0, 5);
    const losers = [...tickers].sort((a, b) => a.change24h - b.change24h).slice(0, 5);

    document.getElementById('movers-table').innerHTML = `
      <table>
        <thead><tr><th>Gainers</th><th>Change</th><th>Losers</th><th>Change</th></tr></thead>
        <tbody>
          ${gainers.map((g, i) => `
            <tr>
              <td style="font-weight:600;">${g.symbol}</td>
              <td><span class="badge badge-success">+${g.change24h.toFixed(2)}%</span></td>
              <td style="font-weight:600;">${losers[i]?.symbol || '-'}</td>
              <td><span class="badge badge-danger">${losers[i]?.change24h.toFixed(2)}%</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  async loadActivity() {
    try {
      const res = await fetch('/api/user/activity?limit=10', { credentials: 'include' });
      const data = await res.json();
      
      if (data.success) {
        document.getElementById('recent-activity').innerHTML = data.activities.map(a => `
          <div class="flex-between" style="padding:12px 0;border-bottom:1px solid var(--border-muted);">
            <div class="flex-col gap-1">
              <span style="font-weight:500;">${a.action}</span>
              <span style="font-size:0.75rem;color:var(--text-muted);">${new Date(a.timestamp).toLocaleString()}</span>
            </div>
            <span style="font-family:var(--font-mono);font-weight:600;color:${a.amount >= 0 ? 'var(--success)' : 'var(--danger)'};">
              ${a.amount >= 0 ? '+' : ''}$${Math.abs(a.amount).toLocaleString()}
            </span>
          </div>
        `).join('') || '<p style="color:var(--text-muted);text-align:center;padding:20px;">No recent activity</p>';
      }
    } catch (error) {
      console.error('Activity load error:', error);
    }
  },

  initCharts() {
    this.initPortfolioChart();
    this.initAllocationChart();
  },

  initPortfolioChart() {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    document.getElementById('portfolio-chart').appendChild(canvas);
    this.portfolioCanvas = canvas;
    this.drawPortfolioChart('7d');
  },

  drawPortfolioChart(period) {
    const ctx = this.portfolioCanvas.getContext('2d');
    const rect = this.portfolioCanvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.portfolioCanvas.width = rect.width * dpr;
    this.portfolioCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const points = period === '24h' ? 24 : period === '7d' ? 7 * 24 : 30 * 24;
    const data = [];
    let base = 10000;
    for (let i = 0; i < points; i++) {
      base += (Math.random() - 0.48) * 100;
      data.push(base);
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

  updatePortfolioChart(period) {
    this.drawPortfolioChart(period);
  },

  initAllocationChart() {
    const container = document.getElementById('allocation-chart');
    const balances = this.balances || [];
    const prices = { BTC: 67432, ETH: 3456, USDT: 1, BNB: 567, SOL: 145 };
    
    const assets = balances
      .filter(b => b.available + b.locked > 0)
      .map(b => ({
        currency: b.currency,
        value: (b.available + b.locked) * (prices[b.currency] || 1),
        color: this.getCurrencyColor(b.currency)
      }))
      .sort((a, b) => b.value - a.value);

    const total = assets.reduce((sum, a) => sum + a.value, 0);
    
    if (total === 0) {
      container.innerHTML = '<p style="color:var(--text-muted);">No assets to display</p>';
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const centerX = 150, centerY = 150, radius = 100;
    let currentAngle = -Math.PI / 2;

    assets.forEach(a => {
      const sliceAngle = (a.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = a.color;
      ctx.fill();
      currentAngle += sliceAngle;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0e17';
    ctx.fill();

    const legend = document.createElement('div');
    legend.style.display = 'flex';
    legend.style.flexWrap = 'wrap';
    legend.style.gap = '12px 24px';
    legend.style.justifyContent = 'center';
    legend.style.marginTop = '20px';
    legend.innerHTML = assets.slice(0, 6).map(a => `
      <div class="flex-center gap-2" style="font-size:0.875rem;">
        <span style="width:12px;height:12px;border-radius:2px;background:${a.color};"></span>
        <span>${a.currency} ${((a.value/total)*100).toFixed(1)}%</span>
      </div>
    `).join('');
    container.appendChild(legend);
  },

  getCurrencyColor(currency) {
    const colors = {
      BTC: '#f7931a', ETH: '#627eea', USDT: '#26a17b', USDC: '#2775ca',
      BNB: '#f3ba2f', SOL: '#00ffa3', XRP: '#23292f', ADA: '#0033ad',
      DOGE: '#c2a633', MATIC: '#8247e5', DOT: '#e6007a', AVAX: '#e84142'
    };
    return colors[currency] || '#00d4ff';
  },

  async cancelOrder(id) {
    try {
      const res = await fetch(`/api/trades/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        this.loadDashboardData();
      }
    } catch (error) {
      console.error('Cancel order error:', error);
    }
  }
};