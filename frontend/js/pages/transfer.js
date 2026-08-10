export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div style="margin-bottom:32px;">
          <a href="/wallet" data-link class="btn btn-ghost btn-sm" style="margin-bottom:16px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg><span>Back to Wallet</span></a>
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Internal Transfer</h1>
          <p style="color:var(--text-secondary);">Instant, fee-free transfers between BITOP accounts</p>
        </div>

        <div class="card" style="max-width:600px;margin:0 auto;">
          <div class="card-header"><h3 class="card-title">Send to Another User</h3></div>
          <form id="transfer-form" style="padding:24px;">
            <div class="input-group" style="margin-bottom:16px;">
              <label style="display:block;margin-bottom:8px;font-size:0.875rem;">Recipient</label>
              <div class="flex-center gap-2">
                <input type="text" id="transfer-recipient" name="recipient" placeholder="Email, username, or user ID" required style="flex:1;">
                <button type="button" class="btn btn-secondary" id="lookup-user">Lookup</button>
              </div>
            </div>

            <div id="recipient-info" style="display:none;margin-bottom:24px;padding:16px;background:var(--bg-secondary);border-radius:var(--radius-md);">
              <div class="flex-center gap-3">
                <div class="avatar" id="recipient-avatar" style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--accent-primary),var(--gold-primary));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.25rem;"></div>
                <div>
                  <div style="font-weight:600;" id="recipient-name"></div>
                  <div style="font-size:0.8125rem;color:var(--text-muted);" id="recipient-email"></div>
                </div>
                <span class="badge badge-success" id="recipient-verified">Verified User</span>
              </div>
            </div>

            <div class="grid grid-2" style="gap:16px;margin-bottom:16px;">
              <div>
                <label style="display:block;margin-bottom:8px;font-size:0.875rem;">Asset</label>
                <select id="transfer-asset" class="select" style="width:100%;" required></select>
              </div>
              <div>
                <label style="display:block;margin-bottom:8px;font-size:0.875rem;">Amount</label>
                <div style="position:relative;">
                  <input type="number" id="transfer-amount" name="amount" step="0.000001" placeholder="0.000000" required style="width:100%;">
                  <div class="flex-center gap-1" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);" id="transfer-percent-btns"></div>
                </div>
                <div class="flex-between" style="margin-top:8px;font-size:0.75rem;color:var(--text-muted);">
                  <span>Available: <span id="transfer-available" style="font-family:var(--font-mono);color:var(--text-secondary);">0.00</span></span>
                </div>
              </div>
            </div>

            <div class="input-group" style="margin-bottom:24px;">
              <label style="display:block;margin-bottom:8px;font-size:0.875rem;">Note (optional)</label>
              <textarea id="transfer-note" name="note" rows="2" placeholder="Add a note for the recipient..." style="width:100%;resize:vertical;"></textarea>
            </div>

            <div style="margin-bottom:16px;padding:16px;background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-md);font-size:0.8125rem;color:var(--text-secondary);">
              <strong>Free instant transfer</strong> - No fees, no confirmations needed. Recipient receives funds immediately.
            </div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" id="transfer-submit">
              <span class="btn-text">Send Transfer</span>
              <span class="loading" style="display:none;"></span>
            </button>
          </form>
        </div>

        <div class="card" style="margin-top:24px;max-width:600px;margin-left:auto;margin-right:auto;">
          <div class="card-header flex-between"><h3 class="card-title">Recent Transfers</h3><a href="/wallet/history" data-link class="btn btn-ghost btn-sm">View All</a></div>
          <div id="transfer-history" style="max-height:300px;overflow-y:auto;"></div>
        </div>
      </div>
    </div>
  `,

  async init() {
    this.balances = {};
    this.recipient = null;
    
    this.bindEvents();
    await this.loadBalances();
    this.renderAssetSelect();
    this.loadTransferHistory();
  },

  bindEvents() {
    document.getElementById('lookup-user').addEventListener('click', () => this.lookupUser());
    document.getElementById('transfer-recipient').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.lookupUser();
    });
    document.getElementById('transfer-asset').addEventListener('change', () => this.updateAvailable());
    document.getElementById('transfer-amount').addEventListener('input', () => this.updateCalculations());
    document.getElementById('transfer-form').addEventListener('submit', (e) => this.handleTransfer(e));
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

  renderAssetSelect() {
    const select = document.getElementById('transfer-asset');
    const assets = Object.keys(this.balances).filter(c => this.balances[c] > 0);
    select.innerHTML = assets.map(c => `<option value="${c}">${c} (${this.balances[c].toLocaleString()})</option>`).join('');
    this.updateAvailable();
  },

  async lookupUser() {
    const identifier = document.getElementById('transfer-recipient').value.trim();
    if (!identifier) return;

    try {
      const response = await fetch(`/api/user/lookup/${encodeURIComponent(identifier)}`, { credentials: 'include' });
      const data = await response.json();

      if (data.success) {
        this.recipient = data.user;
        document.getElementById('recipient-avatar').textContent = data.user.name[0].toUpperCase();
        document.getElementById('recipient-name').textContent = data.user.name;
        document.getElementById('recipient-email').textContent = data.user.email;
        document.getElementById('recipient-verified').textContent = data.user.isVerified ? 'Verified User' : 'Unverified';
        document.getElementById('recipient-verified').className = `badge ${data.user.isVerified ? 'badge-success' : 'badge-warning'}`;
        document.getElementById('recipient-info').style.display = 'block';
      } else {
        this.showToast(data.message || 'User not found', 'error');
        document.getElementById('recipient-info').style.display = 'none';
        this.recipient = null;
      }
    } catch (error) {
      this.showToast('Lookup failed', 'error');
    }
  },

  updateAvailable() {
    const currency = document.getElementById('transfer-asset').value;
    const available = this.balances[currency] || 0;
    document.getElementById('transfer-available').textContent = available.toLocaleString(undefined, { maximumFractionDigits: 8 });

    const percentBtns = document.getElementById('transfer-percent-btns');
    if (available > 0) {
      const percents = [25, 50, 75, 100];
      percentBtns.innerHTML = percents.map(p => `
        <button type="button" class="btn btn-ghost btn-xs" data-pct="${p}" style="padding:2px 6px;font-size:0.625rem;">${p}%</button>
      `).join('');
      
      percentBtns.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          document.getElementById('transfer-amount').value = (available * parseInt(btn.dataset.pct) / 100).toFixed(8);
        });
      });
    }
  },

  updateCalculations() {
    // No calculations needed for free transfers
  },

  async handleTransfer(e) {
    e.preventDefault();
    
    const btn = document.getElementById('transfer-submit');
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');
    
    if (!this.recipient) {
      this.showToast('Please lookup a valid recipient', 'error');
      return;
    }

    const currency = document.getElementById('transfer-asset').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    const note = document.getElementById('transfer-note').value.trim();

    if (!amount || amount <= 0) {
      this.showToast('Enter an amount', 'error');
      return;
    }

    const available = this.balances[currency] || 0;
    if (amount > available) {
      this.showToast('Insufficient balance', 'error');
      return;
    }

    btn.disabled = true;
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';

    try {
      const response = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipientId: this.recipient.id, currency, amount, note })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('Transfer sent successfully', 'success');
        document.getElementById('transfer-form').reset();
        document.getElementById('recipient-info').style.display = 'none';
        this.recipient = null;
        this.loadBalances();
        this.renderAssetSelect();
        this.loadTransferHistory();
      } else {
        this.showToast(data.message || 'Transfer failed', 'error');
      }
    } catch (error) {
      this.showToast('Network error', 'error');
    } finally {
      btn.disabled = false;
      btnText.style.display = 'inline';
      loading.style.display = 'none';
    }
  },

  async loadTransferHistory() {
    try {
      const response = await fetch('/api/wallet/transactions?type=transfer&limit=10', { credentials: 'include' });
      const data = await response.json();

      const container = document.getElementById('transfer-history');
      if (data.success && data.transactions.length) {
        container.innerHTML = data.transactions.map(t => `
          <div class="flex-between" style="padding:12px 0;border-bottom:1px solid var(--border-muted);">
            <div class="flex-col gap-1">
              <div class="flex-center gap-2">
                <span class="badge ${t.direction === 'sent' ? 'badge-danger' : 'badge-success'}" style="font-size:0.625rem;">${t.direction.toUpperCase()}</span>
                <span style="font-family:var(--font-mono);">${t.amount.toLocaleString()} ${t.currency}</span>
              </div>
              <span style="font-size:0.75rem;color:var(--text-muted);">${new Date(t.timestamp).toLocaleString()}</span>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.8125rem;color:var(--text-secondary);">${t.counterpartyName}</span>
            </div>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No recent transfers</p>';
      }
    } catch (error) {
      console.error('Transfer history error:', error);
    }
  },

  showToast(message, type) {
    import('./components/toast.js').then(module => {
      module.showToast(message, type);
    });
  }
};