export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div style="margin-bottom:32px;">
          <a href="/wallet" data-link class="btn btn-ghost btn-sm" style="margin-bottom:16px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg><span>Back to Wallet</span></a>
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Withdraw Cryptocurrency</h1>
          <p style="color:var(--text-secondary);">Send funds to an external wallet address</p>
        </div>

        <div class="grid" style="grid-template-columns:1fr 400px;gap:24px;">
          <div class="card">
            <div class="card-header"><h3 class="card-title">Withdraw Form</h3></div>
            <form id="withdraw-form" style="padding:24px;">
              <div class="input-group" style="margin-bottom:16px;">
                <label style="display:block;margin-bottom:8px;font-size:0.875rem;">Asset</label>
                <select id="withdraw-asset" class="select" style="width:100%;" required></select>
              </div>

              <div class="input-group" style="margin-bottom:16px;">
                <label style="display:block;margin-bottom:8px;font-size:0.875rem;">Network</label>
                <select id="withdraw-network" class="select" style="width:100%;" required></select>
              </div>

              <div class="input-group" style="margin-bottom:16px;">
                <label style="display:block;margin-bottom:8px;font-size:0.875rem;">Destination Address</label>
                <input type="text" id="withdraw-address" name="address" placeholder="Enter wallet address" required style="width:100%;">
              </div>

              <div id="withdraw-memo-field" style="display:none;margin-bottom:16px;">
                <label style="display:block;margin-bottom:8px;font-size:0.875rem;color:var(--danger);">Memo / Tag <span style="color:var(--danger);">(Required)</span></label>
                <input type="text" id="withdraw-memo" name="memo" placeholder="Enter memo/tag" style="width:100%;">
              </div>

              <div class="input-group" style="margin-bottom:16px;">
                <label style="display:block;margin-bottom:8px;font-size:0.875rem;">Amount</label>
                <div style="position:relative;">
                  <input type="number" id="withdraw-amount" name="amount" step="0.000001" placeholder="0.000000" required style="width:100%;">
                  <div class="flex-center gap-1" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);" id="withdraw-percent-btns"></div>
                </div>
                <div class="flex-between" style="margin-top:8px;font-size:0.75rem;color:var(--text-muted);">
                  <span>Available: <span id="withdraw-available" style="font-family:var(--font-mono);color:var(--text-secondary);">0.00</span></span>
                  <span id="withdraw-estimated" style="font-family:var(--font-mono);font-weight:600;">≈ 0.00 USDT</span>
                </div>
              </div>

              <div style="margin-bottom:24px;padding:16px;background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-md);">
                <div class="flex-between" style="margin-bottom:8px;font-size:0.8125rem;">
                  <span>Network Fee</span>
                  <span id="withdraw-fee" style="font-family:var(--font-mono);color:var(--gold-primary);">0.0005 BTC</span>
                </div>
                <div class="flex-between" style="font-size:0.8125rem;">
                  <span style="font-weight:600;">You Receive</span>
                  <span id="withdraw-receive" style="font-family:var(--font-mono);font-weight:700;font-size:1rem;">0.000000</span>
                </div>
              </div>

              <div style="margin-bottom:16px;">
                <label class="flex-center gap-2" style="cursor:pointer;"><input type="checkbox" id="withdraw-whitelist" required><span>I confirm this address is in my withdrawal whitelist</span></label>
              </div>
              <div style="margin-bottom:16px;">
                <label class="flex-center gap-2" style="cursor:pointer;"><input type="checkbox" id="withdraw-confirm" required><span>I have double-checked the address and network</span></label>
              </div>

              <button type="submit" class="btn btn-danger btn-full btn-lg" id="withdraw-submit">
                <span class="btn-text">Withdraw</span>
                <span class="loading" style="display:none;"></span>
              </button>
            </form>
          </div>

          <div>
            <div class="card" style="margin-bottom:24px;">
              <div class="card-header"><h3 class="card-title">Withdrawal Limits</h3></div>
              <div style="padding:24px;" id="withdraw-limits"></div>
            </div>

            <div class="card">
              <div class="card-header flex-between"><h3 class="card-title">Recent Withdrawals</h3><a href="/wallet/history" data-link class="btn btn-ghost btn-sm">View All</a></div>
              <div id="withdraw-history" style="max-height:400px;overflow-y:auto;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  async init(params) {
    this.selectedAsset = params[1] || null;
    this.assets = {};
    this.currentNetwork = null;
    
    this.bindEvents();
    await this.loadAssets();
    
    if (this.selectedAsset) {
      document.getElementById('withdraw-asset').value = this.selectedAsset;
      await this.onAssetChange(this.selectedAsset);
    }
  },

  bindEvents() {
    document.getElementById('withdraw-asset').addEventListener('change', (e) => this.onAssetChange(e.target.value));
    document.getElementById('withdraw-network').addEventListener('change', (e) => this.onNetworkChange(e.target.value));
    document.getElementById('withdraw-amount').addEventListener('input', () => this.updateCalculations());
    document.getElementById('withdraw-form').addEventListener('submit', (e) => this.handleSubmit(e));
  },

  async loadAssets() {
    try {
      const [assetsRes, balancesRes] = await Promise.all([
        fetch('/api/wallet/withdraw-assets', { credentials: 'include' }),
        fetch('/api/wallet/balances', { credentials: 'include' })
      ]);

      const [assetsData, balancesData] = await Promise.all([
        assetsRes.json(), balancesRes.json()
      ]);

      if (assetsData.success) {
        this.assets = {};
        assetsData.assets.forEach(a => this.assets[a.currency] = a);
        
        const select = document.getElementById('withdraw-asset');
        select.innerHTML = Object.values(this.assets).map(a => `<option value="${a.currency}">${a.currency} - ${a.name}</option>`).join('');
      }

      if (balancesData.success) {
        this.balances = balancesData.balances.reduce((acc, b) => ({ ...acc, [b.currency]: b }), {});
      }
    } catch (error) {
      console.error('Load assets error:', error);
    }
  },

  async onAssetChange(currency) {
    this.selectedAsset = currency;
    const asset = this.assets[currency];
    
    if (!asset) return;

    const networkSelect = document.getElementById('withdraw-network');
    networkSelect.innerHTML = asset.networks.map(n => `<option value="${n.network}"${n.isDefault ? ' selected' : ''}>${n.network} ${n.memoRequired ? '(Memo required)' : ''}</option>`).join('');

    this.currentNetwork = asset.networks.find(n => n.isDefault)?.network || asset.networks[0]?.network;
    this.updateMemoField();
    this.updateAvailable();
    this.updateLimits();
    this.updateCalculations();
    this.loadWithdrawHistory();
  },

  onNetworkChange(network) {
    this.currentNetwork = network;
    this.updateMemoField();
    this.updateLimits();
    this.updateCalculations();
  },

  updateMemoField() {
    const asset = this.assets[this.selectedAsset];
    const network = asset?.networks.find(n => n.network === this.currentNetwork);
    const memoField = document.getElementById('withdraw-memo-field');
    
    if (network?.memoRequired) {
      memoField.style.display = 'block';
      document.getElementById('withdraw-memo').required = true;
    } else {
      memoField.style.display = 'none';
      document.getElementById('withdraw-memo').required = false;
    }
  },

  updateAvailable() {
    const balance = this.balances[this.selectedAsset];
    const available = balance?.available || 0;
    document.getElementById('withdraw-available').textContent = available.toLocaleString(undefined, { maximumFractionDigits: 8 });

    const percentBtns = document.getElementById('withdraw-percent-btns');
    if (available > 0) {
      const percents = [25, 50, 75, 100];
      percentBtns.innerHTML = percents.map(p => `
        <button type="button" class="btn btn-ghost btn-xs" data-pct="${p}" style="padding:2px 6px;font-size:0.625rem;">${p}%</button>
      `).join('');
      
      percentBtns.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const pct = parseInt(btn.dataset.pct) / 100;
          document.getElementById('withdraw-amount').value = (available * pct).toFixed(8);
          this.updateCalculations();
        });
      });
    }
  },

  updateLimits() {
    const asset = this.assets[this.selectedAsset];
    const network = asset?.networks.find(n => n.network === this.currentNetwork);
    const container = document.getElementById('withdraw-limits');
    
    if (network) {
      container.innerHTML = `
        <div class="grid grid-2" style="gap:16px;">
          <div><div style="color:var(--text-secondary);font-size:0.75rem;">Minimum</div><div style="font-family:var(--font-mono);font-weight:600;">${network.minWithdrawal} ${this.selectedAsset}</div></div>
          <div><div style="color:var(--text-secondary);font-size:0.75rem;">Maximum (24h)</div><div style="font-family:var(--font-mono);font-weight:600;">${network.maxWithdrawal} ${this.selectedAsset}</div></div>
          <div><div style="color:var(--text-secondary);font-size:0.75rem;">Network Fee</div><div style="font-family:var(--font-mono);font-weight:600;color:var(--gold-primary);">${network.fee} ${this.selectedAsset}</div></div>
          <div><div style="color:var(--text-secondary);font-size:0.75rem;">Daily Limit</div><div style="font-family:var(--font-mono);font-weight:600;">${network.dailyLimit} ${this.selectedAsset}</div></div>
        </div>
      `;
    }
  },

  updateCalculations() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value) || 0;
    const asset = this.assets[this.selectedAsset];
    const network = asset?.networks.find(n => n.network === this.currentNetwork);
    const fee = network?.fee || 0;
    
    const receive = Math.max(0, amount - fee);
    
    document.getElementById('withdraw-fee').textContent = `${fee} ${this.selectedAsset}`;
    document.getElementById('withdraw-receive').textContent = `${receive.toFixed(8)} ${this.selectedAsset}`;
    
    const prices = { BTC: 67432, ETH: 3456, USDT: 1 };
    const price = prices[this.selectedAsset] || 1;
    document.getElementById('withdraw-estimated').textContent = `≈ $${(amount * price).toFixed(2)}`;
  },

  async handleSubmit(e) {
    e.preventDefault();
    
    const btn = document.getElementById('withdraw-submit');
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');
    
    const address = document.getElementById('withdraw-address').value.trim();
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const memo = document.getElementById('withdraw-memo').value.trim();
    const network = this.currentNetwork;
    
    if (!address || !amount || amount <= 0) {
      this.showToast('Please fill in all fields', 'error');
      return;
    }

    const asset = this.assets[this.selectedAsset];
    const net = asset?.networks.find(n => n.network === network);
    if (net?.memoRequired && !memo) {
      this.showToast('Memo/Tag is required for this network', 'error');
      return;
    }

    if (amount < net?.minWithdrawal) {
      this.showToast(`Minimum withdrawal is ${net.minWithdrawal} ${this.selectedAsset}`, 'error');
      return;
    }

    if (amount > net?.maxWithdrawal) {
      this.showToast(`Maximum withdrawal is ${net.maxWithdrawal} ${this.selectedAsset}`, 'error');
      return;
    }

    const balance = this.balances[this.selectedAsset];
    if (!balance || balance.available < amount) {
      this.showToast('Insufficient balance', 'error');
      return;
    }

    btn.disabled = true;
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';

    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currency: this.selectedAsset, amount, address, network, memo })
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('Withdrawal request submitted', 'success');
        document.getElementById('withdraw-form').reset();
        this.updateAvailable();
        this.loadWithdrawHistory();
      } else {
        this.showToast(data.message || 'Withdrawal failed', 'error');
      }
    } catch (error) {
      this.showToast('Network error. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btnText.style.display = 'inline';
      loading.style.display = 'none';
    }
  },

  async loadWithdrawHistory() {
    try {
      const response = await fetch(`/api/wallet/transactions?type=withdrawal&currency=${this.selectedAsset}&limit=10`, { credentials: 'include' });
      const data = await response.json();

      const container = document.getElementById('withdraw-history');
      if (data.success && data.transactions.length) {
        container.innerHTML = data.transactions.map(t => `
          <div class="flex-between" style="padding:12px 0;border-bottom:1px solid var(--border-muted);">
            <div class="flex-col gap-1">
              <div class="flex-center gap-2">
                <span class="badge ${this.getStatusBadgeClass(t.status)}" style="font-size:0.625rem;">${t.status.toUpperCase()}</span>
                <span style="font-family:var(--font-mono);font-size:0.8125rem;">${t.amount.toLocaleString()} ${t.currency}</span>
              </div>
              <span style="font-size:0.75rem;color:var(--text-muted);">${new Date(t.timestamp).toLocaleString()}</span>
            </div>
            <div style="text-align:right;">
              <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);">${t.address?.slice(0, 12)}...</span>
            </div>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No recent withdrawals</p>';
      }
    } catch (error) {
      console.error('Withdraw history error:', error);
    }
  },

  getStatusBadgeClass(status) {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'processing': return 'badge-info';
      case 'failed': return 'badge-danger';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  },

  showToast(message, type) {
    import('./components/toast.js').then(module => {
      module.showToast(message, type);
    });
  }
};