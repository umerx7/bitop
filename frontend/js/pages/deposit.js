export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div style="margin-bottom:32px;">
          <a href="/wallet" data-link class="btn btn-ghost btn-sm" style="margin-bottom:16px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg><span>Back to Wallet</span></a>
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Deposit Cryptocurrency</h1>
          <p style="color:var(--text-secondary);">Generate a deposit address for your selected asset</p>
        </div>

        <div class="grid" style="grid-template-columns:1fr 400px;gap:24px;">
          <div class="card">
            <div class="card-header"><h3 class="card-title">Select Asset</h3></div>
            <div style="padding:16px;">
              <div class="input-group" style="margin-bottom:16px;"><svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><input type="text" id="asset-search" placeholder="Search assets..." style="width:100%;padding-left:40px;"></div>
              <div id="asset-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;"></div>
            </div>
          </div>

          <div id="deposit-details" style="display:none;">
            <div class="card" style="margin-bottom:24px;">
              <div class="card-header"><h3 class="card-title">Deposit <span id="deposit-asset-name"></span></h3></div>
              <div style="padding:24px;">
                <div style="margin-bottom:24px;">
                  <label style="display:block;font-size:0.875rem;color:var(--text-secondary);margin-bottom:8px;">Network</label>
                  <select id="deposit-network" class="select" style="width:100%;"></select>
                </div>
                <div style="margin-bottom:24px;">
                  <label style="display:block;font-size:0.875rem;color:var(--text-secondary);margin-bottom:8px;">Deposit Address</label>
                  <div class="flex-center gap-2">
                    <code id="deposit-address" style="flex:1;background:var(--bg-secondary);padding:12px 16px;border-radius:var(--radius-md);border:1px solid var(--border-muted);font-family:var(--font-mono);font-size:0.875rem;word-break:break-all;"></code>
                    <button class="btn btn-secondary" id="copy-address"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                  </div>
                </div>
                <div id="deposit-memo" style="display:none;margin-bottom:24px;">
                  <label style="display:block;font-size:0.875rem;color:var(--text-secondary);margin-bottom:8px;">Memo / Tag <span style="color:var(--danger);">(Required)</span></label>
                  <div class="flex-center gap-2">
                    <code id="deposit-memo-value" style="flex:1;background:var(--bg-secondary);padding:12px 16px;border-radius:var(--radius-md);border:1px solid var(--border-muted);font-family:var(--font-mono);font-size:0.875rem;"></code>
                    <button class="btn btn-secondary" id="copy-memo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                  </div>
                </div>
                <div id="deposit-qr" style="margin-bottom:24px;text-align:center;">
                  <canvas id="qr-canvas"></canvas>
                  <p style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;">Scan with your wallet app</p>
                </div>
                <div style="padding:16px;background:var(--bg-secondary);border-radius:var(--radius-md);font-size:0.8125rem;color:var(--text-secondary);">
                  <strong>Important:</strong>
                  <ul style="margin:8px 0 0 20px;display:flex;flex-direction:column;gap:4px;">
                    <li>Only send <span id="deposit-asset-symbol"></span> to this address</li>
                    <li id="memo-warning" style="display:none;color:var(--danger);">Always include the memo/tag or funds may be lost</li>
                    <li>Minimum deposit: <span id="min-deposit"></span></li>
                    <li>Deposits require <span id="confirmations"></span> network confirmations</li>
                    <li>Do not send other assets or use wrong network</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header flex-between"><h3 class="card-title">Recent Deposits</h3><a href="/wallet/history" data-link class="btn btn-ghost btn-sm">View All</a></div>
              <div id="deposit-history" style="max-height:300px;overflow-y:auto;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  async init(params) {
    this.selectedAsset = params[1] || null;
    this.assets = [];
    this.networks = {};
    
    this.bindEvents();
    await this.loadAssets();
    
    if (this.selectedAsset) {
      this.selectAsset(this.selectedAsset);
    }
  },

  bindEvents() {
    document.getElementById('asset-search').addEventListener('input', (e) => this.filterAssets(e.target.value));
    document.getElementById('copy-address').addEventListener('click', () => this.copyAddress());
    document.getElementById('copy-memo').addEventListener('click', () => this.copyMemo());
    document.getElementById('deposit-network').addEventListener('change', (e) => this.switchNetwork(e.target.value));
  },

  async loadAssets() {
    try {
      const response = await fetch('/api/wallet/deposit-assets', { credentials: 'include' });
      const data = await response.json();
      
      if (data.success) {
        this.assets = data.assets;
        this.renderAssetGrid();
      }
    } catch (error) {
      console.error('Load assets error:', error);
    }
  },

  renderAssetGrid() {
    const grid = document.getElementById('asset-grid');
    grid.innerHTML = this.assets.map(a => `
      <button class="asset-btn ${this.selectedAsset === a.currency ? 'active' : ''}" data-currency="${a.currency}" style="padding:16px;background:var(--bg-secondary);border:1px solid var(--border-muted);border-radius:var(--radius-md);cursor:pointer;text-align:left;transition:all var(--transition-fast);">
        <div class="flex-center gap-2" style="margin-bottom:8px;">
          <span class="badge badge-info" style="font-size:0.625rem;">${a.currency}</span>
        </div>
        <div style="font-weight:600;">${a.name}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">${a.networks.length} network${a.networks.length > 1 ? 's' : ''}</div>
      </button>
    `).join('');

    grid.querySelectorAll('.asset-btn').forEach(btn => {
      btn.addEventListener('click', () => this.selectAsset(btn.dataset.currency));
    });
  },

  filterAssets(query) {
    const buttons = document.querySelectorAll('.asset-btn');
    const q = query.toLowerCase();
    buttons.forEach(btn => {
      const currency = btn.dataset.currency.toLowerCase();
      const name = btn.textContent.toLowerCase();
      btn.style.display = currency.includes(q) || name.includes(q) ? '' : 'none';
    });
  },

  async selectAsset(currency) {
    this.selectedAsset = currency;
    document.querySelectorAll('.asset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.currency === currency);
    });

    const asset = this.assets.find(a => a.currency === currency);
    if (!asset) return;

    this.networks = {};
    asset.networks.forEach(n => this.networks[n.network] = n);

    document.getElementById('deposit-details').style.display = 'block';
    document.getElementById('deposit-asset-name').textContent = `${asset.name} (${asset.currency})`;
    document.getElementById('deposit-asset-symbol').textContent = asset.currency;

    const networkSelect = document.getElementById('deposit-network');
    networkSelect.innerHTML = asset.networks.map(n => `<option value="${n.network}"${n.isDefault ? ' selected' : ''}>${n.network}</option>`).join('');

    await this.loadDepositAddress(asset.networks[0].network);
    await this.loadDepositHistory();
  },

  async switchNetwork(network) {
    await this.loadDepositAddress(network);
  },

  async loadDepositAddress(network) {
    try {
      const response = await fetch(`/api/wallet/deposit-address/${this.selectedAsset}?network=${network}`, { credentials: 'include' });
      const data = await response.json();

      if (data.success) {
        const info = data.address;
        document.getElementById('deposit-address').textContent = info.address;
        
        const memoDiv = document.getElementById('deposit-memo');
        const memoWarning = document.getElementById('memo-warning');
        if (info.memo) {
          document.getElementById('deposit-memo-value').textContent = info.memo;
          memoDiv.style.display = 'block';
          memoWarning.style.display = 'block';
        } else {
          memoDiv.style.display = 'none';
          memoWarning.style.display = 'none';
        }

        document.getElementById('min-deposit').textContent = info.minDeposit || '0';
        document.getElementById('confirmations').textContent = info.confirmations || '1';

        this.generateQR(info.address, info.memo);
      }
    } catch (error) {
      console.error('Load deposit address error:', error);
    }
  },

  generateQR(address, memo) {
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    
    // Simple QR code placeholder
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', size/2, size/2);
    ctx.fillText(address.slice(0, 20) + '...', size/2, size/2 + 20);
    if (memo) ctx.fillText('Memo: ' + memo.slice(0, 20), size/2, size/2 + 40);
  },

  async loadDepositHistory() {
    try {
      const response = await fetch(`/api/wallet/transactions?type=deposit&currency=${this.selectedAsset}&limit=10`, { credentials: 'include' });
      const data = await response.json();

      const container = document.getElementById('deposit-history');
      if (data.success && data.transactions.length) {
        container.innerHTML = data.transactions.map(t => `
          <div class="flex-between" style="padding:12px 0;border-bottom:1px solid var(--border-muted);">
            <div class="flex-col gap-1">
              <div class="flex-center gap-2">
                <span class="badge badge-success" style="font-size:0.625rem;">${t.status.toUpperCase()}</span>
                <span style="font-family:var(--font-mono);font-size:0.8125rem;">${t.amount.toLocaleString()} ${t.currency}</span>
              </div>
              <span style="font-size:0.75rem;color:var(--text-muted);">${new Date(t.timestamp).toLocaleString()}</span>
            </div>
            <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);">${t.txHash?.slice(0, 12)}...</span>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No recent deposits</p>';
      }
    } catch (error) {
      console.error('Deposit history error:', error);
    }
  },

  copyAddress() {
    const address = document.getElementById('deposit-address').textContent;
    navigator.clipboard.writeText(address).then(() => this.showToast('Address copied!', 'success'));
  },

  copyMemo() {
    const memo = document.getElementById('deposit-memo-value').textContent;
    navigator.clipboard.writeText(memo).then(() => this.showToast('Memo copied!', 'success'));
  },

  showToast(message, type) {
    import('./components/toast.js').then(module => {
      module.showToast(message, type);
    });
  }
};