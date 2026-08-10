export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div class="flex-between flex-wrap gap-4" style="margin-bottom:24px;align-items:center;">
          <div>
            <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Wallet</h1>
            <p style="color:var(--text-secondary);">Manage your deposits, withdrawals, and balances</p>
          </div>
          <div class="flex-center gap-2">
            <a href="/wallet/deposit" data-link class="btn btn-primary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span>Deposit</span></a>
            <a href="/wallet/withdraw" data-link class="btn btn-secondary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 19 19 12"></polyline></svg><span>Withdraw</span></a>
          </div>
        </div>

        <div class="grid grid-4" style="gap:20px;margin-bottom:24px;" id="wallet-summary"></div>

        <div class="grid" style="grid-template-columns:1fr 350px;gap:24px;">
          <div class="card">
            <div class="card-header flex-between">
              <h3 class="card-title">Balances</h3>
              <div class="input-group" style="width:200px;">
                <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" id="balance-search" placeholder="Search assets..." style="width:100%;padding-left:40px;">
              </div>
            </div>
            <div class="table-wrapper" id="balances-table"></div>
          </div>

          <div>
            <div class="card" style="margin-bottom:24px;">
              <div class="card-header"><h3 class="card-title">Quick Actions</h3></div>
              <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">
                <a href="/wallet/deposit" data-link class="btn btn-primary flex-center gap-2" style="justify-content:flex-start;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span>Deposit Crypto</span></a>
                <a href="/wallet/withdraw" data-link class="btn btn-secondary flex-center gap-2" style="justify-content:flex-start;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 19 19 12"></polyline></svg><span>Withdraw Crypto</span></a>
                <a href="/wallet/transfer" data-link class="btn btn-ghost flex-center gap-2" style="justify-content:flex-start;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"></path><path d="M2 12h20"></path></svg><span>Internal Transfer</span></a>
                <a href="/wallet/convert" data-link class="btn btn-ghost flex-center gap-2" style="justify-content:flex-start;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 1 1 2.12 9.36L1 14"></path></svg><span>Convert</span></a>
              </div>
            </div>

            <div class="card">
              <div class="card-header"><h3 class="card-title">Recent Activity</h3></div>
              <div id="wallet-activity" style="max-height:350px;overflow-y:auto;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  async init() {
    this.bindEvents();
    await this.loadWalletData();
    this.startAutoRefresh();
  },

  bindEvents() {
    document.getElementById('balance-search').addEventListener('input', (e) => this.filterBalances(e.target.value));
  },

  async loadWalletData() {
    try {
      const [balancesRes, activityRes] = await Promise.all([
        fetch('/api/wallet/balances', { credentials: 'include' }),
        fetch('/api/wallet/transactions?limit=20', { credentials: 'include' })
      ]);

      const [balancesData, activityData] = await Promise.all([
        balancesRes.json(), activityRes.json()
      ]);

      if (balancesData.success) {
        this.balances = balancesData.balances;
        this.renderSummary();
        this.renderBalancesTable();
      }

      if (activityData.success) {
        this.renderActivity(activityData.transactions);
      }
    } catch (error) {
      console.error('Wallet load error:', error);
    }
  },

  renderSummary() {
    const prices = { BTC: 67432, ETH: 3456, USDT: 1, USDC: 1, BNB: 567, SOL: 145 };
    let totalValue = 0;
    let availableValue = 0;
    let lockedValue = 0;

    this.balances.forEach(b => {
      const price = prices[b.currency] || 1;
      const total = (b.available + b.locked) * price;
      totalValue += total;
      availableValue += b.available * price;
      lockedValue += b.locked * price;
    });

    const cards = [
      { label: 'Total Balance', value: '$' + totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), change: 'Estimated value', positive: null, icon: '💰' },
      { label: 'Available', value: '$' + availableValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), change: 'Ready to use', positive: null, icon: '✅' },
      { label: 'In Orders', value: '$' + lockedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), change: 'Locked in trades', positive: null, icon: '🔒' },
      { label: 'Assets', value: this.balances.filter(b => b.available + b.locked > 0).length.toString(), change: 'Non-zero balances', positive: null, icon: '🪙' }
    ];

    document.getElementById('wallet-summary').innerHTML = cards.map(c => `
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

  renderBalancesTable() {
    const prices = { BTC: 67432, ETH: 3456, USDT: 1, USDC: 1, BNB: 567, SOL: 145 };
    const table = document.getElementById('balances-table');
    
    const nonZero = this.balances.filter(b => b.available + b.locked > 0);
    const zero = this.balances.filter(b => b.available + b.locked === 0);

    table.innerHTML = `
      <table>
        <thead>
          <tr><th>Asset</th><th>Available</th><th>Locked</th><th>Est. Value</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${[...nonZero, ...zero].map(b => {
            const price = prices[b.currency] || 0;
            const value = (b.available + b.locked) * price;
            return `
              <tr style="${value === 0 ? 'opacity:0.5;' : ''}">
                <td>
                  <div class="flex-center gap-2">
                    <span class="badge badge-info" style="font-size:0.625rem;padding:2px 6px;">${b.currency}</span>
                    <span style="font-weight:600;">${b.currency}</span>
                  </div>
                </td>
                <td style="font-family:var(--font-mono);">${b.available.toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                <td style="font-family:var(--font-mono);color:var(--text-muted);">${b.locked.toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                <td style="font-family:var(--font-mono);font-weight:500;">$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>
                  <div class="flex-center gap-1">
                    <a href="/wallet/deposit?currency=${b.currency}" data-link class="btn btn-ghost btn-xs" title="Deposit">⬇</a>
                    ${value > 0 ? `<a href="/wallet/withdraw?currency=${b.currency}" data-link class="btn btn-ghost btn-xs" title="Withdraw">⬆</a>` : ''}
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  },

  filterBalances(query) {
    const rows = document.querySelectorAll('#balances-table tbody tr');
    const q = query.toLowerCase();
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? '' : 'none';
    });
  },

  renderActivity(transactions) {
    const container = document.getElementById('wallet-activity');
    
    if (!transactions.length) {
      container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No recent transactions</p>';
      return;
    }

    container.innerHTML = transactions.map(t => {
      const isDeposit = t.type === 'deposit';
      const isWithdrawal = t.type === 'withdrawal';
      return `
        <div class="flex-between" style="padding:12px 0;border-bottom:1px solid var(--border-muted);">
          <div class="flex-col gap-1">
            <div class="flex-center gap-2">
              <span class="badge ${isDeposit ? 'badge-success' : isWithdrawal ? 'badge-danger' : 'badge-info'}" style="font-size:0.625rem;">${t.type.toUpperCase()}</span>
              <span style="font-weight:500;">${t.currency}</span>
            </div>
            <span style="font-size:0.75rem;color:var(--text-muted);">${new Date(t.timestamp).toLocaleString()}</span>
          </div>
          <div style="text-align:right;">
            <span style="font-family:var(--font-mono);font-weight:600;color:${isDeposit ? 'var(--success)' : isWithdrawal ? 'var(--danger)' : 'var(--text-primary)'};">
              ${isDeposit ? '+' : isWithdrawal ? '-' : ''}${t.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${t.currency}
            </span>
            <div style="font-size:0.75rem;color:var(--text-muted);">${t.status}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  startAutoRefresh() {
    this.refreshInterval = setInterval(() => this.loadWalletData(), 30000);
  },

  destroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }
};