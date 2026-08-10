export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container" style="max-width:1000px;">
        <div style="margin-bottom:32px;">
          <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px;">API Documentation</h1>
          <p style="color:var(--text-secondary);">REST & WebSocket APIs for programmatic trading</p>
        </div>

        <div class="card" style="margin-bottom:24px;padding:24px;">
          <div class="flex-between flex-wrap gap-4" style="align-items:center;margin-bottom:24px;">
            <div>
              <h3 style="font-weight:600;margin-bottom:4px;">Getting Started</h3>
              <p style="color:var(--text-secondary);">Create API keys in <a href="/settings" data-link style="color:var(--accent-primary);">Settings → API Keys</a></p>
            </div>
            <div class="flex-center gap-2">
              <a href="/settings" data-link class="btn btn-primary">Create API Key</a>
              <button class="btn btn-secondary" id="download-openapi">Download OpenAPI Spec</button>
            </div>
          </div>

          <div class="grid grid-3" style="gap:16px;">
            <div class="card" style="padding:20px;background:var(--bg-secondary);border-color:var(--accent-primary);">
              <h4 style="font-weight:600;margin-bottom:8px;">REST API</h4>
              <p style="color:var(--text-secondary);font-size:0.875rem;margin-bottom:16px;">Synchronous HTTP endpoints for trading, account, and market data</p>
              <code style="font-size:0.75rem;color:var(--accent-primary);">https://api.bitop.com/v1</code>
            </div>
            <div class="card" style="padding:20px;background:var(--bg-secondary);border-color:var(--gold-primary);">
              <h4 style="font-weight:600;margin-bottom:8px;">WebSocket API</h4>
              <p style="color:var(--text-secondary);font-size:0.875rem;margin-bottom:16px;">Real-time market data, order updates, and account notifications</p>
              <code style="font-size:0.75rem;color:var(--gold-primary);">wss://ws.bitop.com/v1</code>
            </div>
            <div class="card" style="padding:20px;background:var(--bg-secondary);border-color:var(--success);">
              <h4 style="font-weight:600;margin-bottom:8px;">Rate Limits</h4>
              <p style="color:var(--text-secondary);font-size:0.875rem;margin-bottom:16px;">Tier-based limits with generous quotas for active traders</p>
              <code style="font-size:0.75rem;color:var(--success);">120 req/min (standard)</code>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:24px;">
          <div style="padding:16px 24px;border-bottom:1px solid var(--border-muted);">
            <div class="flex-center gap-2 flex-wrap" id="api-nav">
              <button class="tab-btn btn-sm active" data-api-section="auth">Authentication</button>
              <button class="tab-btn btn-sm" data-api-section="market">Market Data</button>
              <button class="tab-btn btn-sm" data-api-section="trading">Trading</button>
              <button class="tab-btn btn-sm" data-api-section="account">Account</button>
              <button class="tab-btn btn-sm" data-api-section="wallet">Wallet</button>
              <button class="tab-btn btn-sm" data-api-section="websocket">WebSocket</button>
            </div>
          </div>
          <div id="api-content" style="padding:24px;"></div>
        </div>

        <div class="card">
          <div style="padding:24px;">
            <h3 style="font-weight:600;margin-bottom:16px;">Authentication</h3>
            <p style="color:var(--text-secondary);margin-bottom:24px;">All private endpoints require HMAC-SHA256 signed requests.</p>
            
            <h4 style="font-weight:600;margin-bottom:12px;">Headers</h4>
            <pre style="background:var(--bg-tertiary);padding:16px;border-radius:var(--radius-md);overflow-x:auto;font-size:0.8125rem;"><code>X-BITOP-APIKEY: your_api_key
X-BITOP-TIMESTAMP: unix_timestamp_ms
X-BITOP-SIGNATURE: hmac_sha256_signature
X-BITOP-PASSPHRASE: your_passphrase (optional)</code></pre>

            <h4 style="font-weight:600;margin:24px 0 12px;">Signature Generation</h4>
            <pre style="background:var(--bg-tertiary);padding:16px;border-radius:var(--radius-md);overflow-x:auto;font-size:0.8125rem;"><code>const message = timestamp + method + requestPath + body;
const signature = hmac_sha256(secret, message).toString('hex');</code></pre>

            <h4 style="font-weight:600;margin:24px 0 12px;">Permissions</h4>
            <div class="grid grid-3" style="gap:12px;">
              <span class="badge badge-success">Read</span>
              <span class="badge badge-warning">Trade</span>
              <span class="badge badge-danger">Withdraw</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  init() {
    this.bindEvents();
    this.renderSection('auth');
  },

  bindEvents() {
    document.querySelectorAll('[data-api-section]').forEach(btn => {
      btn.addEventListener('click', () => this.renderSection(btn.dataset.apiSection));
    });
  },

  renderSection(section) {
    document.querySelectorAll('[data-api-section]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.apiSection === section);
    });

    const content = document.getElementById('api-content');
    const sections = {
      auth: this.getAuthEndpoints(),
      market: this.getMarketEndpoints(),
      trading: this.getTradingEndpoints(),
      account: this.getAccountEndpoints(),
      wallet: this.getWalletEndpoints(),
      websocket: this.getWebsocketEndpoints()
    };

    content.innerHTML = sections[section] || sections.auth;
  },

  getAuthEndpoints() {
    return `
      <h4 style="font-weight:600;margin-bottom:16px;">Authentication Endpoints</h4>
      ${this.endpointTable([
        ['POST', '/auth/login', 'User login', 'Public'],
        ['POST', '/auth/register', 'User registration', 'Public'],
        ['POST', '/auth/logout', 'User logout', 'Private'],
        ['GET', '/auth/me', 'Get current user', 'Private'],
        ['POST', '/auth/verify-email/:token', 'Verify email', 'Public'],
        ['POST', '/auth/resend-verification', 'Resend verification', 'Private'],
        ['POST', '/auth/forgot-password', 'Request password reset', 'Public'],
        ['POST', '/auth/reset-password/:token', 'Reset password', 'Public'],
        ['PUT', '/auth/update-password', 'Change password', 'Private'],
        ['PUT', '/auth/preferences', 'Update preferences', 'Private'],
        ['POST', '/auth/refresh-token', 'Refresh access token', 'Public']
      ])}
    `;
  },

  getMarketEndpoints() {
    return `
      <h4 style="font-weight:600;margin-bottom:16px;">Market Data Endpoints</h4>
      ${this.endpointTable([
        ['GET', '/market/tickers', 'All ticker data', 'Public'],
        ['GET', '/market/ticker/:symbol', 'Single ticker', 'Public'],
        ['GET', '/market/klines/:symbol', 'Candlestick data', 'Public'],
        ['GET', '/market/orderbook/:symbol', 'Order book depth', 'Public'],
        ['GET', '/market/trades/:symbol', 'Recent trades', 'Public'],
        ['GET', '/market/symbols', 'Trading pairs info', 'Public']
      ])}
    `;
  },

  getTradingEndpoints() {
    return `
      <h4 style="font-weight:600;margin-bottom:16px;">Trading Endpoints (Private)</h4>
      ${this.endpointTable([
        ['POST', '/trades', 'Place new order', 'Trade'],
        ['GET', '/trades', 'Order history', 'Read'],
        ['GET', '/trades/open', 'Open orders', 'Read'],
        ['GET', '/trades/:id', 'Order details', 'Read'],
        ['DELETE', '/trades/:id', 'Cancel order', 'Trade'],
        ['DELETE', '/trades', 'Cancel all orders', 'Trade'],
        ['GET', '/trades/fills', 'Trade fills', 'Read']
      ])}
    `;
  },

  getAccountEndpoints() {
    return `
      <h4 style="font-weight:600;margin-bottom:16px;">Account Endpoints (Private)</h4>
      ${this.endpointTable([
        ['GET', '/user/profile', 'User profile', 'Read'],
        ['PUT', '/user/profile', 'Update profile', 'Read'],
        ['GET', '/user/activity', 'Account activity', 'Read'],
        ['GET', '/user/referral', 'Referral stats', 'Read'],
        ['GET', '/user/referral/referrals', 'Referral list', 'Read'],
        ['GET', '/user/referral/earnings', 'Referral earnings', 'Read'],
        ['GET', '/kyc/status', 'KYC status', 'Read'],
        ['POST', '/kyc/submit', 'Submit KYC', 'Read']
      ])}
    `;
  },

  getWalletEndpoints() {
    return `
      <h4 style="font-weight:600;margin-bottom:16px;">Wallet Endpoints (Private)</h4>
      ${this.endpointTable([
        ['GET', '/wallet/balances', 'All balances', 'Read'],
        ['GET', '/wallet/transactions', 'Transaction history', 'Read'],
        ['GET', '/wallet/deposit-address/:currency', 'Deposit address', 'Read'],
        ['POST', '/wallet/withdraw', 'Withdraw', 'Withdraw'],
        ['POST', '/wallet/transfer', 'Internal transfer', 'Trade'],
        ['POST', '/wallet/convert', 'Convert assets', 'Trade'],
        ['GET', '/wallet/withdraw-assets', 'Withdrawable assets', 'Read'],
        ['GET', '/wallet/deposit-assets', 'Depositable assets', 'Read']
      ])}
    `;
  },

  getWebsocketEndpoints() {
    return `
      <h4 style="font-weight:600;margin-bottom:16px;">WebSocket API</h4>
      <p style="color:var(--text-secondary);margin-bottom:16px;">Connect to <code>wss://ws.bitop.com/v1</code> with authentication.</p>
      
      <h5 style="font-weight:600;margin:16px 0 8px;">Connection</h5>
      <pre style="background:var(--bg-tertiary);padding:16px;border-radius:var(--radius-md);overflow-x:auto;font-size:0.8125rem;"><code>const ws = new WebSocket('wss://ws.bitop.com/v1?token=YOUR_JWT');</code></pre>

      <h5 style="font-weight:600;margin:16px 0 8px;">Subscribe to Channels</h5>
      <pre style="background:var(--bg-tertiary);padding:16px;border-radius:var(--radius-md);overflow-x:auto;font-size:0.8125rem;"><code>ws.send(JSON.stringify({
  op: 'subscribe',
  args: ['tickers', 'trades:BTC/USDT', 'orderbook:BTC/USDT']
}));</code></pre>

      <h5 style="font-weight:600;margin:16px 0 8px;">Available Channels</h5>
      ${this.endpointTable([
        ['tickers', 'All ticker updates', '~1/sec'],
        ['trades:{symbol}', 'Real-time trades', 'Per trade'],
        ['orderbook:{symbol}', 'Order book updates', '~10/sec'],
        ['kline:{symbol}:{interval}', 'Candlestick updates', 'Per interval'],
        ['account', 'Balance & order updates', 'Per event']
      ], ['Channel', 'Description', 'Frequency'])}
    `;
  },

  endpointTable(rows, headers = ['Method', 'Endpoint', 'Description', 'Auth']) {
    return `
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
          <thead><tr style="border-bottom:1px solid var(--border-muted);">${headers.map(h => `<th style="text-align:left;padding:12px 8px;">${h}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(r => `<tr style="border-bottom:1px solid var(--border-muted);">${r.map(c => `<td style="padding:12px 8px;${c.startsWith('/') ? 'font-family:var(--font-mono);' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
    `;
  }
};