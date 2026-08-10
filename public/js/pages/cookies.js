export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container" style="max-width:800px;">
        <div style="margin-bottom:32px;">
          <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px;">Cookie Policy</h1>
          <p style="color:var(--text-secondary);">Last updated: January 2024</p>
        </div>

        <div class="card" style="padding:32px;line-height:1.8;">
          <h2 style="font-weight:600;margin:24px 0 12px;">What Are Cookies</h2>
          <p>Cookies are small text files stored on your device when you visit websites. They help websites function properly, remember preferences, and provide analytics.</p>

          <h2 style="font-weight:600;margin:24px 0 12px;">Types of Cookies We Use</h2>
          
          <h3 style="font-weight:600;margin:16px 0 8px;">Essential Cookies (Always Active)</h3>
          <p>Required for core functionality:</p>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li><strong>Authentication:</strong> Session management, login state</li>
            <li><strong>Security:</strong> CSRF protection, rate limiting, fraud detection</li>
            <li><strong>Preferences:</strong> Theme, language, currency settings</li>
            <li><strong>Trading:</strong> Order book state, chart preferences, active pairs</li>
          </ul>

          <h3 style="font-weight:600;margin:16px 0 8px;">Analytics Cookies (Optional)</h3>
          <p>Help us understand usage patterns (with your consent):</p>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li><strong>Page views:</strong> Popular pages, user flows</li>
            <li><strong>Feature usage:</strong> Trading tools, chart types, order types</li>
            <li><strong>Performance:</strong> Load times, error rates</li>
          </ul>

          <h3 style="font-weight:600;margin:16px 0 8px;">Marketing Cookies (Optional)</h3>
          <p>For personalized communications (with your consent):</p>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li><strong>Referral tracking:</strong> Attribute signups to referrers</li>
            <li><strong>Campaign measurement:</strong> Email, ad effectiveness</li>
          </ul>

          <h2 style="font-weight:600;margin:24px 0 12px;">Cookie Details</h2>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
              <thead><tr style="border-bottom:1px solid var(--border-muted);"><th style="text-align:left;padding:12px;">Name</th><th style="text-align:left;padding:12px;">Type</th><th style="text-align:left;padding:12px;">Purpose</th><th style="text-align:left;padding:12px;">Expires</th></tr></thead>
              <tbody>
                <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;font-family:var(--font-mono);">bitop_token</td><td style="padding:12px;">Essential</td><td style="padding:12px;">JWT authentication token</td><td style="padding:12px;">7 days</td></tr>
                <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;font-family:var(--font-mono);">bitop_refresh_token</td><td style="padding:12px;">Essential</td><td style="padding:12px;">Token refresh</td><td style="padding:12px;">30 days</td></tr>
                <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;font-family:var(--font-mono);">bitop_theme</td><td style="padding:12px;">Essential</td><td style="padding:12px;">Theme preference</td><td style="padding:12px;">1 year</td></tr>
                <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;font-family:var(--font-mono);">bitop_currency</td><td style="padding:12px;">Essential</td><td style="padding:12px;">Default currency</td><td style="padding:12px;">1 year</td></tr>
                <tr style="border-bottom:1px solid var(--border-muted);"><td style="padding:12px;font-family:var(--font-mono);">_ga</td><td style="padding:12px;">Analytics</td><td style="padding:12px;">Google Analytics</td><td style="padding:12px;">2 years</td></tr>
              </tbody>
            </table>
          </div>

          <h2 style="font-weight:600;margin:24px 0 12px;">Managing Cookies</h2>
          <p>You can control cookies through:</p>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li>Browser settings (block, delete, alert)</li>
            <li>Our cookie consent banner (analytics/marketing)</li>
            <li>Settings page (essential cookies cannot be disabled)</li>
          </ul>
          <p>Disabling essential cookies will break core functionality like login and trading.</p>

          <h2 style="font-weight:600;margin:24px 0 12px;">Third-Party Cookies</h2>
          <p>We may use third-party services that set their own cookies:</p>
          <ul style="margin-left:20px;margin-bottom:16px;">
            <li>Google Analytics (analytics)</li>
            <li>Socket.io (real-time updates)</li>
            <li>Email providers (transactional emails)</li>
          </ul>

          <h2 style="font-weight:600;margin:24px 0 12px;">Contact</h2>
          <p>Questions about cookies? Contact us at privacy@bitop.com.</p>
        </div>
      </div>
    </div>
  `,

  init() {}
};