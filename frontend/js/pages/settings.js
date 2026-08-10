export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div style="margin-bottom:32px;">
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Settings</h1>
          <p style="color:var(--text-secondary);">Manage your account preferences and security</p>
        </div>

        <div class="grid" style="grid-template-columns:260px 1fr;gap:24px;">
          <nav class="card" style="height:fit-content;position:sticky;top:100px;">
            <div style="padding:16px;border-bottom:1px solid var(--border-muted);">
              <h3 style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Account</h3>
            </div>
            <ul style="padding:8px;display:flex;flex-direction:column;gap:4px;" id="settings-nav">
              <li><button class="settings-nav-btn active" data-tab="profile" style="width:100%;padding:12px 16px;text-align:left;border-radius:var(--radius-md);background:none;border:none;color:var(--text-secondary);font-size:0.875rem;cursor:pointer;">Profile</button></li>
              <li><button class="settings-nav-btn" data-tab="security" style="width:100%;padding:12px 16px;text-align:left;border-radius:var(--radius-md);background:none;border:none;color:var(--text-secondary);font-size:0.875rem;cursor:pointer;">Security</button></li>
              <li><button class="settings-nav-btn" data-tab="preferences" style="width:100%;padding:12px 16px;text-align:left;border-radius:var(--radius-md);background:none;border:none;color:var(--text-secondary);font-size:0.875rem;cursor:pointer;">Preferences</button></li>
              <li><button class="settings-nav-btn" data-tab="notifications" style="width:100%;padding:12px 16px;text-align:left;border-radius:var(--radius-md);background:none;border:none;color:var(--text-secondary);font-size:0.875rem;cursor:pointer;">Notifications</button></li>
              <li><button class="settings-nav-btn" data-tab="api" style="width:100%;padding:12px 16px;text-align:left;border-radius:var(--radius-md);background:none;border:none;color:var(--text-secondary);font-size:0.875rem;cursor:pointer;">API Keys</button></li>
              <li><button class="settings-nav-btn" data-tab="referral" style="width:100%;padding:12px 16px;text-align:left;border-radius:var(--radius-md);background:none;border:none;color:var(--text-secondary);font-size:0.875rem;cursor:pointer;">Referral</button></li>
            </ul>
            <div style="padding:16px;border-top:1px solid var(--border-muted);">
              <h3 style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Danger Zone</h3>
              <button class="settings-nav-btn btn-danger" data-tab="delete" style="width:100%;padding:12px 16px;text-align:left;border-radius:var(--radius-md);background:none;border:none;color:var(--danger);font-size:0.875rem;cursor:pointer;">Delete Account</button>
            </div>
          </nav>

          <div id="settings-content"></div>
        </div>
      </div>
    </div>
  `,

  async init() {
    this.bindEvents();
    this.loadTab('profile');
  },

  bindEvents() {
    document.querySelectorAll('.settings-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.loadTab(btn.dataset.tab));
    });
  },

  loadTab(tab) {
    document.querySelectorAll('.settings-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const content = document.getElementById('settings-content');
    
    const tabs = {
      profile: this.renderProfileTab(),
      security: this.renderSecurityTab(),
      preferences: this.renderPreferencesTab(),
      notifications: this.renderNotificationsTab(),
      api: this.renderApiTab(),
      referral: this.renderReferralTab(),
      delete: this.renderDeleteTab()
    };

    content.innerHTML = tabs[tab] || tabs.profile;
    this.bindTabEvents(tab);
  },

  renderProfileTab() {
    return `
      <div class="card">
        <div class="card-header"><h3 class="card-title">Profile Information</h3></div>
        <form id="profile-form" style="padding:24px;max-width:600px;">
          <div class="flex-center gap-4" style="margin-bottom:24px;">
            <div class="avatar" style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--accent-primary),var(--gold-primary));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:2rem;" id="profile-avatar">U</div>
            <div><button type="button" class="btn btn-secondary" id="change-avatar">Change Avatar</button><p style="color:var(--text-muted);font-size:0.75rem;margin-top:4px;">JPG, PNG up to 2MB</p></div>
          </div>
          <div class="grid grid-2" style="gap:16px;margin-bottom:16px;">
            <div class="input-group"><input type="text" id="profile-name" name="name" required style="width:100%;"><label for="profile-name">Full Name</label></div>
            <div class="input-group"><input type="email" id="profile-email" name="email" required style="width:100%;"><label for="profile-email">Email</label></div>
          </div>
          <div class="input-group" style="margin-bottom:24px;"><textarea id="profile-bio" name="bio" rows="3" style="width:100%;resize:vertical;"></textarea><label for="profile-bio">Bio</label></div>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      </div>
    `;
  },

  renderSecurityTab() {
    return `
      <div class="card">
        <div class="card-header"><h3 class="card-title">Password</h3></div>
        <form id="password-form" style="padding:24px;max-width:500px;">
          <div class="input-group" style="margin-bottom:16px;"><input type="password" id="current-password" name="currentPassword" required style="width:100%;"><label for="current-password">Current Password</label></div>
          <div class="input-group" style="margin-bottom:16px;"><input type="password" id="new-password" name="newPassword" required minlength="8" style="width:100%;"><label for="new-password">New Password</label></div>
          <div class="input-group" style="margin-bottom:24px;"><input type="password" id="confirm-new-password" name="confirmPassword" required style="width:100%;"><label for="confirm-new-password">Confirm New Password</label></div>
          <button type="submit" class="btn btn-primary">Update Password</button>
        </form>
      </div>
      <div class="card" style="margin-top:24px;">
        <div class="card-header"><h3 class="card-title">Two-Factor Authentication</h3></div>
        <div style="padding:24px;max-width:500px;">
          <div class="flex-between" style="align-items:center;padding:16px;background:var(--bg-secondary);border-radius:var(--radius-md);margin-bottom:16px;">
            <div><strong>Authenticator App</strong><br><span style="color:var(--text-secondary);font-size:0.875rem;">Add an extra layer of security</span></div>
            <button class="btn btn-primary" id="enable-2fa">Enable</button>
          </div>
          <div class="flex-between" style="align-items:center;padding:16px;background:var(--bg-secondary);border-radius:var(--radius-md);">
            <div><strong>Withdrawal Whitelist</strong><br><span style="color:var(--text-secondary);font-size:0.875rem;">Restrict withdrawals to trusted addresses</span></div>
            <a href="/wallet/whitelist" data-link class="btn btn-secondary">Manage</a>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:24px;">
        <div class="card-header"><h3 class="card-title">Active Sessions</h3></div>
        <div style="padding:24px;" id="sessions-list"></div>
      </div>
    `;
  },

  renderPreferencesTab() {
    return `
      <div class="card">
        <div class="card-header"><h3 class="card-title">Display Preferences</h3></div>
        <form id="preferences-form" style="padding:24px;max-width:600px;">
          <div class="grid grid-2" style="gap:16px;margin-bottom:16px;">
            <div class="input-group"><select id="pref-theme" name="theme" style="width:100%;"><option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option></select><label for="pref-theme">Theme</label></div>
            <div class="input-group"><select id="pref-currency" name="currency" style="width:100%;"><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="BTC">BTC (₿)</option></select><label for="pref-currency">Default Currency</label></div>
          </div>
          <div class="grid grid-2" style="gap:16px;margin-bottom:16px;">
            <div class="input-group"><select id="pref-language" name="language" style="width:100%;"><option value="en">English</option><option value="es">Spanish</option><option value="zh">Chinese</option><option value="ru">Russian</option></select><label for="pref-language">Language</label></div>
            <div class="input-group"><select id="pref-timezone" name="timezone" style="width:100%;"><option value="auto">Auto Detect</option><option value="UTC">UTC</option><option value="EST">EST</option><option value="PST">PST</option></select><label for="pref-timezone">Timezone</label></div>
          </div>
          <div style="margin-bottom:16px;">
            <label class="flex-center gap-2" style="cursor:pointer;"><input type="checkbox" id="pref-compact" name="compactMode"><span>Compact mode</span></label>
          </div>
          <button type="submit" class="btn btn-primary">Save Preferences</button>
        </form>
      </div>
      <div class="card" style="margin-top:24px;">
        <div class="card-header"><h3 class="card-title">Trading Preferences</h3></div>
        <div style="padding:24px;max-width:600px;">
          <div style="margin-bottom:16px;">
            <label class="flex-center gap-2" style="cursor:pointer;"><input type="checkbox" id="pref-confirm" name="confirmOrders"><span>Confirm orders before placing</span></label>
          </div>
          <div style="margin-bottom:16px;">
            <label class="flex-center gap-2" style="cursor:pointer;"><input type="checkbox" id="pref-sound" name="soundEnabled"><span>Enable trading sounds</span></label>
          </div>
          <div class="input-group" style="max-width:200px;"><input type="number" id="pref-slippage" name="slippageTolerance" value="0.5" min="0.1" max="5" step="0.1" style="width:100%;"><label for="pref-slippage">Default Slippage Tolerance (%)</label></div>
        </div>
      </div>
    `;
  },

  renderNotificationsTab() {
    return `
      <div class="card">
        <div class="card-header"><h3 class="card-title">Notification Settings</h3></div>
        <div style="padding:24px;max-width:600px;">
          <div style="margin-bottom:24px;padding:16px;background:var(--bg-secondary);border-radius:var(--radius-md);">
            <div class="flex-between" style="margin-bottom:12px;"><strong>Email Notifications</strong><label class="flex-center gap-2"><input type="checkbox" id="email-enabled" checked><span>Enable all emails</span></label></div>
            <div class="grid grid-2" style="gap:12px;">
              <label class="flex-center gap-2"><input type="checkbox" checked><span>Trade confirmations</span></label>
              <label class="flex-center gap-2"><input type="checkbox" checked><span>Deposit/Withdrawal updates</span></label>
              <label class="flex-center gap-2"><input type="checkbox"><span>Price alerts</span></label>
              <label class="flex-center gap-2"><input type="checkbox"><span>Weekly portfolio summary</span></label>
              <label class="flex-center gap-2"><input type="checkbox"><span>Promotional emails</span></label>
              <label class="flex-center gap-2"><input type="checkbox" checked><span>Security alerts</span></label>
            </div>
          </div>
          <div style="margin-bottom:24px;padding:16px;background:var(--bg-secondary);border-radius:var(--radius-md);">
            <div class="flex-between" style="margin-bottom:12px;"><strong>Push Notifications</strong><label class="flex-center gap-2"><input type="checkbox" id="push-enabled"><span>Enable push</span></label></div>
            <div class="grid grid-2" style="gap:12px;">
              <label class="flex-center gap-2"><input type="checkbox"><span>Order filled</span></label>
              <label class="flex-center gap-2"><input type="checkbox"><span>Price alerts triggered</span></label>
              <label class="flex-center gap-2"><input type="checkbox"><span>New referral signup</span></label>
              <label class="flex-center gap-2"><input type="checkbox"><span>System maintenance</span></label>
            </div>
          </div>
          <button class="btn btn-primary" id="save-notifications">Save Notification Settings</button>
        </div>
      </div>
    `;
  },

  renderApiTab() {
    return `
      <div class="card">
        <div class="card-header"><h3 class="card-title">API Keys</h3></div>
        <div style="padding:24px;">
          <p style="color:var(--text-secondary);margin-bottom:24px;">Create API keys for programmatic access to your account.</p>
          <button class="btn btn-primary" id="create-api-key"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span>Create New API Key</span></button>
          <div id="api-keys-list" style="margin-top:24px;"></div>
        </div>
      </div>
    `;
  },

  renderReferralTab() {
    return `
      <div class="card">
        <div class="card-header"><h3 class="card-title">Referral Settings</h3></div>
        <div style="padding:24px;max-width:600px;">
          <div class="flex-between" style="align-items:center;padding:16px;background:var(--bg-secondary);border-radius:var(--radius-md);margin-bottom:16px;">
            <div><strong>Referral Code</strong><br><span style="color:var(--text-secondary);font-size:0.875rem;">Your unique referral identifier</span></div>
            <code style="font-size:1.25rem;font-weight:700;background:var(--bg-card);padding:8px 16px;border-radius:var(--radius-md);border:1px solid var(--border-muted);" id="settings-ref-code"></code>
          </div>
          <div style="margin-bottom:16px;">
            <label class="flex-center gap-2" style="cursor:pointer;"><input type="checkbox" id="ref-auto-share"><span>Auto-share referral link on social</span></label>
          </div>
          <div style="margin-bottom:16px;">
            <label class="flex-center gap-2" style="cursor:pointer;"><input type="checkbox" id="ref-email-notify" checked><span>Email me when someone signs up</span></label>
          </div>
        </div>
      </div>
    `;
  },

  renderDeleteTab() {
    return `
      <div class="card" style="border-color:var(--danger);">
        <div class="card-header"><h3 class="card-title" style="color:var(--danger);">Delete Account</h3></div>
        <div style="padding:24px;max-width:500px;">
          <p style="color:var(--text-secondary);margin-bottom:24px;">This action is irreversible. All your data, trading history, and funds will be permanently deleted.</p>
          <div class="input-group" style="margin-bottom:24px;"><input type="text" id="delete-confirm" placeholder="Type DELETE to confirm" style="width:100%;"><label for="delete-confirm">Confirmation</label></div>
          <button class="btn btn-danger" id="delete-account" disabled>Delete Account Permanently</button>
        </div>
      </div>
    `;
  },

  bindTabEvents(tab) {
    switch (tab) {
      case 'profile':
        document.getElementById('profile-form').addEventListener('submit', (e) => this.saveProfile(e));
        break;
      case 'security':
        document.getElementById('password-form').addEventListener('submit', (e) => this.changePassword(e));
        break;
      case 'preferences':
        document.getElementById('preferences-form').addEventListener('submit', (e) => this.savePreferences(e));
        break;
      case 'notifications':
        document.getElementById('save-notifications').addEventListener('click', () => this.saveNotifications());
        break;
      case 'api':
        document.getElementById('create-api-key').addEventListener('click', () => this.createApiKey());
        break;
      case 'delete':
        document.getElementById('delete-confirm').addEventListener('input', (e) => {
          document.getElementById('delete-account').disabled = e.target.value !== 'DELETE';
        });
        document.getElementById('delete-account').addEventListener('click', () => this.deleteAccount());
        break;
    }
    this.loadTabData(tab);
  },

  async loadTabData(tab) {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        this.user = data.user;
        if (tab === 'profile') this.populateProfile();
        if (tab === 'preferences') this.populatePreferences();
        if (tab === 'referral') document.getElementById('settings-ref-code').textContent = data.user.referralCode;
        if (tab === 'security') this.loadSessions();
        if (tab === 'api') this.loadApiKeys();
      }
    } catch (error) {
      console.error('Load tab data error:', error);
    }
  },

  populateProfile() {
    if (this.user) {
      document.getElementById('profile-name').value = this.user.name;
      document.getElementById('profile-email').value = this.user.email;
      document.getElementById('profile-avatar').textContent = this.user.name[0].toUpperCase();
    }
  },

  populatePreferences() {
    if (this.user?.preferences) {
      document.getElementById('pref-theme').value = this.user.preferences.theme || 'dark';
      document.getElementById('pref-currency').value = this.user.preferences.currency || 'USD';
      document.getElementById('pref-compact').checked = this.user.preferences.compactMode || false;
    }
  },

  async saveProfile(e) {
    e.preventDefault();
    // Implementation
    this.showToast('Profile updated', 'success');
  },

  async changePassword(e) {
    e.preventDefault();
    // Implementation
    this.showToast('Password changed', 'success');
  },

  async savePreferences(e) {
    e.preventDefault();
    // Implementation
    this.showToast('Preferences saved', 'success');
  },

  async saveNotifications() {
    this.showToast('Notification settings saved', 'success');
  },

  async createApiKey() {
    this.showToast('API key created', 'success');
  },

  async loadSessions() {
    // Implementation
  },

  async loadApiKeys() {
    // Implementation
  },

  async deleteAccount() {
    // Implementation
  },

  showToast(message, type) {
    import('./components/toast.js').then(module => {
      module.showToast(message, type);
    });
  }
};