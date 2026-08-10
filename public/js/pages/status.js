export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container" style="max-width:800px;">
        <div style="margin-bottom:32px;">
          <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px;">System Status</h1>
          <p style="color:var(--text-secondary);">Real-time platform health and incident history</p>
        </div>

        <div class="card" style="margin-bottom:24px;">
          <div style="padding:24px;">
            <div class="flex-between" style="align-items:center;margin-bottom:24px;">
              <h3 style="font-weight:600;">Overall Status</h3>
              <span class="badge badge-success" style="font-size:1rem;padding:8px 16px;">All Systems Operational</span>
            </div>
            <div class="grid grid-4" style="gap:16px;">
              <div class="status-component">
                <div class="flex-center gap-2" style="margin-bottom:8px;">
                  <span class="badge badge-success">Operational</span>
                  <strong>Trading Engine</strong>
                </div>
                <div style="font-size:0.8125rem;color:var(--text-secondary);">Order matching, order books</div>
              </div>
              <div class="status-component">
                <div class="flex-center gap-2" style="margin-bottom:8px;">
                  <span class="badge badge-success">Operational</span>
                  <strong>Market Data</strong>
                </div>
                <div style="font-size:0.8125rem;color:var(--text-secondary);">Tickers, charts, WebSocket</div>
              </div>
              <div class="status-component">
                <div class="flex-center gap-2" style="margin-bottom:8px;">
                  <span class="badge badge-success">Operational</span>
                  <strong>Deposits</strong>
                </div>
                <div style="font-size:0.8125rem;color:var(--text-secondary);">Blockchain monitoring</div>
              </div>
              <div class="status-component">
                <div class="flex-center gap-2" style="margin-bottom:8px;">
                  <span class="badge badge-success">Operational</span>
                  <strong>Withdrawals</strong>
                </div>
                <div style="font-size:0.8125rem;color:var(--text-secondary);">Processing & blockchain</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom:24px;">
          <div style="padding:16px 24px;border-bottom:1px solid var(--border-muted);">
            <h3 style="font-weight:600;">Component Details</h3>
          </div>
          <div style="padding:16px 24px;">
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
                <thead><tr style="border-bottom:1px solid var(--border-muted);"><th style="text-align:left;padding:12px;">Component</th><th style="text-align:left;padding:12px;">Status</th><th style="text-align:left;padding:12px;">Latency</th><th style="text-align:left;padding:12px;">Uptime (30d)</th><th style="text-align:left;padding:12px;">Last Incident</th></tr></thead>
                <tbody>
                  <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;">Trading Engine</td><td style="padding:12px;"><span class="badge badge-success">Operational</span></td><td style="padding:12px;font-family:var(--font-mono);">2.3ms</td><td style="padding:12px;">99.99%</td><td style="padding:12px;color:var(--text-muted);">12 days ago</td></tr>
                  <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;">Market Data API</td><td style="padding:12px;"><span class="badge badge-success">Operational</span></td><td style="padding:12px;font-family:var(--font-mono);">1.8ms</td><td style="padding:12px;">99.98%</td><td style="padding:12px;color:var(--text-muted);">Never</td></tr>
                  <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;">WebSocket</td><td style="padding:12px;"><span class="badge badge-success">Operational</span></td><td style="padding:12px;font-family:var(--font-mono);">45ms</td><td style="padding:12px;">99.95%</td><td style="padding:12px;color:var(--text-muted);">3 days ago</td></tr>
                  <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;">Deposits (BTC)</td><td style="padding:12px;"><span class="badge badge-success">Operational</span></td><td style="padding:12px;font-family:var(--font-mono);">1 conf</td><td style="padding:12px;">100%</td><td style="padding:12px;color:var(--text-muted);">Never</td></tr>
                  <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;">Deposits (ETH)</td><td style="padding:12px;"><span class="badge badge-success">Operational</span></td><td style="padding:12px;font-family:var(--font-mono);">12 conf</td><td style="padding:12px;">100%</td><td style="padding:12px;color:var(--text-muted);">Never</td></tr>
                  <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;">Withdrawals</td><td style="padding:12px;"><span class="badge badge-success">Operational</span></td><td style="padding:12px;font-family:var(--font-mono);">2.1min</td><td style="padding:12px;">99.97%</td><td style="padding:12px;color:var(--text-muted);">5 days ago</td></tr>
                  <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;">Website</td><td style="padding:12px;"><span class="badge badge-success">Operational</span></td><td style="padding:12px;font-family:var(--font-mono);">89ms</td><td style="padding:12px;">99.99%</td><td style="padding:12px;color:var(--text-muted);">Never</td></tr>
                  <tr><td style="padding:12px;">REST API</td><td style="padding:12px;"><span class="badge badge-success">Operational</span></td><td style="padding:12px;font-family:var(--font-mono);">12ms</td><td style="padding:12px;">99.98%</td><td style="padding:12px;color:var(--text-muted);">Never</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card">
          <div style="padding:16px 24px;border-bottom:1px solid var(--border-muted);">
            <h3 style="font-weight:600;">Recent Incidents</h3>
          </div>
          <div style="padding:24px;">
            <div class="incident" style="padding:16px 0;border-bottom:1px solid var(--border-muted);">
              <div class="flex-between" style="margin-bottom:8px;">
                <div class="flex-center gap-2">
                  <span class="badge badge-warning">Degraded Performance</span>
                  <strong>WebSocket Connection Drops</strong>
                </div>
                <span style="color:var(--text-muted);font-size:0.875rem;">Jan 15, 2024 · 2 min</span>
              </div>
              <p style="color:var(--text-secondary);font-size:0.875rem;">Intermittent WebSocket disconnects for ~2 minutes. Root cause: load balancer config update. Resolved automatically.</p>
            </div>
            <div class="incident" style="padding:16px 0;border-bottom:1px solid var(--border-muted);">
              <div class="flex-between" style="margin-bottom:8px;">
                <div class="flex-center gap-2">
                  <span class="badge badge-danger">Partial Outage</span>
                  <strong>Withdrawal Delays</strong>
                </div>
                <span style="color:var(--text-muted);font-size:0.875rem;">Jan 10, 2024 · 45 min</span>
              </div>
              <p style="color:var(--text-secondary);font-size:0.875rem;">Hot wallet refill required manual approval. Processing queue built up. Automated refill threshold adjusted.</p>
            </div>
            <div class="incident" style="padding:16px 0;">
              <div class="flex-between" style="margin-bottom:8px;">
                <div class="flex-center gap-2">
                  <span class="badge badge-info">Maintenance</span>
                  <strong>Scheduled Maintenance</strong>
                </div>
                <span style="color:var(--text-muted);font-size:0.875rem;">Jan 5, 2024 · 30 min</span>
              </div>
              <p style="color:var(--text-secondary);font-size:0.875rem;">Database optimization and index rebuild. Completed ahead of schedule.</p>
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:24px;">
          <div style="padding:24px;text-align:center;">
            <h3 style="font-weight:600;margin-bottom:12px;">Subscribe to Updates</h3>
            <p style="color:var(--text-secondary);margin-bottom:24px;">Get real-time status notifications via email or webhook</p>
            <div class="flex-center gap-3 flex-wrap">
              <a href="/settings" data-link class="btn btn-primary">Email Notifications</a>
              <button class="btn btn-secondary" id="webhook-setup">Webhook Integration</button>
              <a href="https://status.bitop.com" target="_blank" rel="noopener" class="btn btn-ghost">Status Page</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  init() {}
};