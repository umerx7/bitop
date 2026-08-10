export default {
  template: `
    <div class="auth-page" style="min-height:calc(100vh - var(--header-height) - var(--footer-height));display:flex;align-items:center;justify-content:center;padding:60px 24px;">
      <div class="card" style="width:100%;max-width:440px;text-align:center;">
        <a href="/" data-link class="logo flex-center gap-2" style="justify-content:center;margin-bottom:32px;text-decoration:none;">
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#grad)"/>
            <path d="M8 16L14 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <defs><linearGradient id="grad" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stop-color="#00d4ff"/><stop offset="100%" stop-color="#ffd700"/></linearGradient></defs>
          </svg>
          <span style="font-size:2rem;font-weight:800;background:linear-gradient(135deg,#00d4ff 0%,#ffd700 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">BITOP</span>
        </a>

        <div id="verify-state-pending" style="display:none;">
          <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,rgba(0,212,255,0.15),rgba(255,215,0,0.15));display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:2rem;">📧</div>
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:12px;">Check Your Email</h1>
          <p style="color:var(--text-secondary);margin-bottom:24px;">We've sent a verification link to <strong id="verify-email-display"></strong></p>
          <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:32px;">Click the link in the email to verify your account. The link expires in 24 hours.</p>
          
          <button class="btn btn-primary btn-lg" id="resend-btn" style="margin-bottom:16px;">
            <span class="btn-text">Resend Verification Email</span>
            <span class="loading" style="display:none;"></span>
          </button>
          
          <p style="color:var(--text-muted);font-size:0.8125rem;">Didn't receive the email? <a href="#" id="resend-link" style="color:var(--accent-primary);">Check spam folder</a> or resend.</p>
        </div>

        <div id="verify-state-success" style="display:none;">
          <div style="width:80px;height:80px;border-radius:50%;background:var(--success);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:12px;">Email Verified!</h1>
          <p style="color:var(--text-secondary);margin-bottom:32px;">Your account has been successfully verified. You can now start trading.</p>
          <a href="/dashboard" data-link class="btn btn-primary btn-lg">Go to Dashboard</a>
        </div>

        <div id="verify-state-error" style="display:none;">
          <div style="width:80px;height:80px;border-radius:50%;background:var(--danger);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:12px;">Verification Failed</h1>
          <p style="color:var(--text-secondary);margin-bottom:24px;" id="verify-error-message"></p>
          <div class="flex-center gap-3 flex-wrap">
            <a href="/register" data-link class="btn btn-primary">Create New Account</a>
            <a href="/login" data-link class="btn btn-secondary">Sign In</a>
          </div>
        </div>

        <div id="verify-state-verified" style="display:none;">
          <div style="width:80px;height:80px;border-radius:50%;background:var(--accent-primary);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:12px;">Already Verified</h1>
          <p style="color:var(--text-secondary);margin-bottom:32px;">Your email is already verified. You can sign in to your account.</p>
          <a href="/login" data-link class="btn btn-primary btn-lg">Sign In</a>
        </div>
      </div>
    </div>
  `,

  async init() {
    this.bindEvents();
    await this.checkVerificationStatus();
  },

  bindEvents() {
    const resendBtn = document.getElementById('resend-btn');
    const resendLink = document.getElementById('resend-link');
    
    if (resendBtn) {
      resendBtn.addEventListener('click', () => this.resendVerification());
    }
    if (resendLink) {
      resendLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.resendVerification();
      });
    }
  },

  async checkVerificationStatus() {
    const token = window.location.pathname.split('/').pop();
    
    if (token && token !== 'verify-email') {
      await this.verifyWithToken(token);
    } else {
      this.showPendingState();
    }
  },

  async verifyWithToken(token) {
    try {
      const response = await fetch(`/api/auth/verify-email/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('bitop_token', data.token);
        localStorage.setItem('bitop_refresh_token', data.refreshToken);
        localStorage.setItem('bitop_user', JSON.stringify(data.user));
        this.showSuccessState();
      } else if (data.message?.includes('already verified')) {
        this.showAlreadyVerifiedState();
      } else {
        this.showErrorState(data.message || 'Invalid or expired verification link');
      }
    } catch (error) {
      this.showErrorState('Network error. Please try again.');
    }
  },

  async resendVerification() {
    const btn = document.getElementById('resend-btn');
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');

    btn.disabled = true;
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        this.showToast('Verification email sent successfully', 'success');
      } else {
        this.showToast(data.message || 'Failed to send verification email', 'error');
      }
    } catch (error) {
      this.showToast('Network error. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btnText.style.display = 'inline';
      loading.style.display = 'none';
    }
  },

  showPendingState() {
    const userEmail = localStorage.getItem('bitop_user') ? JSON.parse(localStorage.getItem('bitop_user')).email : '';
    if (userEmail) {
      document.getElementById('verify-email-display').textContent = userEmail;
    }
    this.hideAllStates();
    document.getElementById('verify-state-pending').style.display = 'block';
  },

  showSuccessState() {
    this.hideAllStates();
    document.getElementById('verify-state-success').style.display = 'block';
  },

  showErrorState(message) {
    this.hideAllStates();
    document.getElementById('verify-error-message').textContent = message;
    document.getElementById('verify-state-error').style.display = 'block';
  },

  showAlreadyVerifiedState() {
    this.hideAllStates();
    document.getElementById('verify-state-verified').style.display = 'block';
  },

  hideAllStates() {
    ['verify-state-pending', 'verify-state-success', 'verify-state-error', 'verify-state-verified'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  },

  showToast(message, type) {
    import('./components/toast.js').then(module => {
      module.showToast(message, type);
    });
  }
};