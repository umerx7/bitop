export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div style="margin-bottom:32px;">
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Referral Program</h1>
          <p style="color:var(--text-secondary);">Earn up to 40% commission on trading fees from your referrals</p>
        </div>

        <div class="card" style="background:linear-gradient(135deg,rgba(0,212,255,0.1),rgba(255,215,0,0.1));border:1px solid var(--border-gold);margin-bottom:24px;">
          <div style="padding:32px;">
            <div class="grid grid-4" style="gap:24px;text-align:center;" id="referral-stats"></div>
            <div style="margin-top:24px;padding-top:24px;border-top:1px solid var(--border-gold);text-align:center;">
              <p style="color:var(--text-secondary);margin-bottom:16px;">Your referral code</p>
              <div class="flex-center gap-3 flex-wrap">
                <code id="referral-code-display" style="font-size:1.5rem;font-weight:700;background:var(--bg-card);padding:12px 24px;border-radius:var(--radius-md);border:1px solid var(--border-muted);letter-spacing:2px;"></code>
                <button class="btn btn-primary" id="copy-code"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy</span></button>
                <a href="/register?ref=" data-link id="share-link" class="btn btn-secondary"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg><span>Share</span></a>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-2" style="gap:24px;margin-bottom:24px;">
          <div class="card">
            <div class="card-header"><h3 class="card-title">Commission Tiers</h3></div>
            <div style="padding:16px;">
              <div style="overflow-x:auto;">
                <table style="width:100%;font-size:0.875rem;">
                  <thead><tr style="border-bottom:1px solid var(--border-muted);"><th style="text-align:left;padding:12px;">Tier</th><th style="text-align:left;padding:12px;">Direct Referrals</th><th style="text-align:left;padding:12px;">Commission Rate</th></tr></thead>
                  <tbody>
                    <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;">Bronze</td><td style="padding:12px;">0-9</td><td style="padding:12px;"><span class="badge badge-info">20%</span></td></tr>
                    <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;">Silver</td><td style="padding:12px;">10-49</td><td style="padding:12px;"><span class="badge badge-success">30%</span></td></tr>
                    <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;">Gold</td><td style="padding:12px;">50-199</td><td style="padding:12px;"><span class="badge badge-gold">35%</span></td></tr>
                    <tr><td style="padding:12px;">Diamond</td><td style="padding:12px;">200+</td><td style="padding:12px;"><span class="badge" style="background:linear-gradient(135deg,#00d4ff,#ffd700);color:#000;">40%</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><h3 class="card-title">How It Works</h3></div>
            <div style="padding:16px;display:flex;flex-direction:column;gap:16px;">
              <div class="flex-center gap-3"><div style="width:32px;height:32px;border-radius:50%;background:var(--accent-primary);display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">1</div><div><strong>Share your link</strong><br><span style="color:var(--text-secondary);font-size:0.875rem;">Invite friends with your unique referral code</span></div></div>
              <div class="flex-center gap-3"><div style="width:32px;height:32px;border-radius:50%;background:var(--accent-primary);display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">2</div><div><strong>They trade</strong><br><span style="color:var(--text-secondary);font-size:0.875rem;">Your referrals trade on BITOP</span></div></div>
              <div class="flex-center gap-3"><div style="width:32px;height:32px;border-radius:50%;background:var(--accent-primary);display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">3</div><div><strong>You earn</strong><br><span style="color:var(--text-secondary);font-size:0.875rem;">Receive up to 40% of their trading fees</span></div></div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:24px;">
          <div class="card-header flex-between">
            <h3 class="card-title">Your Referrals</h3>
            <select id="referral-filter" class="select" style="min-width:140px;padding:6px 10px;font-size:0.8125rem;">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div class="table-wrapper" id="referrals-table"></div>
        </div>

        <div class="card">
          <div class="card-header"><h3 class="card-title">Earnings History</h3></div>
          <div class="table-wrapper" id="earnings-table"></div>
        </div>
      </div>
    </div>
  `,

  async init() {
    await this.loadReferralData();
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('copy-code').addEventListener('click', () => this.copyCode());
    document.getElementById('referral-filter').addEventListener('change', () => this.renderReferralsTable());
    document.getElementById('share-link').addEventListener('click', (e) => {
      e.preventDefault();
      navigator.share?.({ title: 'Join BITOP', url: window.location.origin + '/register?ref=' + this.referralCode });
    });
  },

  async loadReferralData() {
    try {
      const [statsRes, referralsRes, earningsRes] = await Promise.all([
        fetch('/api/referral/stats', { credentials: 'include' }),
        fetch('/api/referral/referrals', { credentials: 'include' }),
        fetch('/api/referral/earnings', { credentials: 'include' })
      ]);

      const [statsData, referralsData, earningsData] = await Promise.all([
        statsRes.json(), referralsRes.json(), earningsRes.json()
      ]);

      if (statsData.success) {
        this.stats = statsData.stats;
        this.referralCode = statsData.referralCode;
        this.renderStats();
        document.getElementById('referral-code-display').textContent = this.referralCode;
        document.getElementById('share-link').href = '/register?ref=' + this.referralCode;
      }

      if (referralsData.success) {
        this.referrals = referralsData.referrals;
        this.renderReferralsTable();
      }

      if (earningsData.success) {
        this.earnings = earningsData.earnings;
        this.renderEarningsTable();
      }
    } catch (error) {
      console.error('Referral load error:', error);
    }
  },

  renderStats() {
    const container = document.getElementById('referral-stats');
    const s = this.stats;
    container.innerHTML = `
      <div><div style="font-size:2rem;font-weight:800;font-family:var(--font-mono);color:var(--gold-primary);">${s.totalReferrals || 0}</div><div style="color:var(--text-secondary);font-size:0.875rem;">Total Referrals</div></div>
      <div><div style="font-size:2rem;font-weight:800;font-family:var(--font-mono);color:var(--success);">$${(s.totalEarnings || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</div><div style="color:var(--text-secondary);font-size:0.875rem;">Total Earnings</div></div>
      <div><div style="font-size:2rem;font-weight:800;font-family:var(--font-mono);color:var(--accent-primary);">${(s.commissionRate || 20)}%</div><div style="color:var(--text-secondary);font-size:0.875rem;">Commission Rate</div></div>
      <div><div style="font-size:2rem;font-weight:800;font-family:var(--font-mono);color:var(--text-primary);">$${(s.pendingEarnings || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</div><div style="color:var(--text-secondary);font-size:0.875rem;">Pending</div></div>
    `;
  },

  renderReferralsTable() {
    const filter = document.getElementById('referral-filter').value;
    const table = document.getElementById('referrals-table');
    
    let filtered = this.referrals;
    const now = Date.now();
    if (filter === 'today') filtered = filtered.filter(r => now - new Date(r.createdAt).getTime() < 86400000);
    else if (filter === 'week') filtered = filtered.filter(r => now - new Date(r.createdAt).getTime() < 604800000);
    else if (filter === 'month') filtered = filtered.filter(r => now - new Date(r.createdAt).getTime() < 2592000000);

    if (!filtered.length) {
      table.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);">No referrals yet. Share your code to start earning!</div>';
      return;
    }

    table.innerHTML = `
      <table>
        <thead><tr><th>User</th><th>Joined</th><th>Status</th><th>Trades</th><th>Volume</th><th>Earnings</th></tr></thead>
        <tbody>
          ${filtered.map(r => `
            <tr>
              <td><div class="flex-center gap-2"><div class="avatar" style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent-primary),var(--gold-primary));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.875rem;">${r.name[0]}</div><span>${r.name}</span></div></td>
              <td style="color:var(--text-secondary);font-size:0.875rem;">${new Date(r.createdAt).toLocaleDateString()}</td>
              <td><span class="badge ${r.isVerified ? 'badge-success' : 'badge-warning'}">${r.isVerified ? 'Verified' : 'Pending'}</span></td>
              <td style="font-family:var(--font-mono);">${r.tradeCount || 0}</td>
              <td style="font-family:var(--font-mono);">$${(r.volume || 0).toLocaleString()}</td>
              <td style="font-family:var(--font-mono);color:var(--success);font-weight:600;">$${(r.earnings || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  renderEarningsTable() {
    const table = document.getElementById('earnings-table');
    
    if (!this.earnings.length) {
      table.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);">No earnings yet</div>';
      return;
    }

    table.innerHTML = `
      <table>
        <thead><tr><th>Date</th><th>Referral</th><th>Trade Pair</th><th>Fee</th><th>Commission %</th><th>Earned</th><th>Status</th></tr></thead>
        <tbody>
          ${this.earnings.slice(0, 50).map(e => `
            <tr>
              <td style="color:var(--text-secondary);font-size:0.875rem;">${new Date(e.timestamp).toLocaleString()}</td>
              <td>${e.referralName}</td>
              <td style="font-family:var(--font-mono);font-weight:600;">${e.pair}</td>
              <td style="font-family:var(--font-mono);">$${e.fee.toFixed(4)}</td>
              <td>${e.commissionRate}%</td>
              <td style="font-family:var(--font-mono);color:var(--success);font-weight:600;">$${e.amount.toFixed(2)}</td>
              <td><span class="badge ${e.status === 'paid' ? 'badge-success' : 'badge-info'}">${e.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  copyCode() {
    navigator.clipboard.writeText(this.referralCode).then(() => {
      this.showToast('Referral code copied!', 'success');
    });
  },

  showToast(message, type) {
    import('./components/toast.js').then(module => {
      module.showToast(message, type);
    });
  }
};