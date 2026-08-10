export default {
  template: `
    <div class="auth-page" style="min-height:calc(100vh - var(--header-height) - var(--footer-height));display:flex;align-items:center;justify-content:center;padding:60px 24px;">
      <div class="card" style="width:100%;max-width:440px;">
        <div style="text-align:center;margin-bottom:32px;">
          <a href="/" data-link class="logo flex-center gap-2" style="justify-content:center;margin-bottom:24px;text-decoration:none;">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#grad)"/>
              <path d="M8 16L14 22L24 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <defs><linearGradient id="grad" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stop-color="#00d4ff"/><stop offset="100%" stop-color="#ffd700"/></linearGradient></defs>
            </svg>
            <span style="font-size:1.75rem;font-weight:800;background:linear-gradient(135deg,#00d4ff 0%,#ffd700 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">BITOP</span>
          </a>
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Forgot Password?</h1>
          <p style="color:var(--text-secondary);">Enter your email and we'll send you a reset link</p>
        </div>

        <form id="forgot-form" novalidate>
          <div id="forgot-error" class="toast error" style="display:none;margin-bottom:20px;"></div>
          <div id="forgot-success" class="toast success" style="display:none;margin-bottom:20px;"></div>
          
          <div class="input-group" style="margin-bottom:24px;">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            <input type="email" id="email" name="email" placeholder="Email address" required autocomplete="email" style="width:100%;">
            <label for="email" style="position:absolute;left:44px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;transition:all var(--transition-fast);font-size:0.875rem;">Email address</label>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" id="forgot-btn">
            <span class="btn-text">Send Reset Link</span>
            <span class="loading" style="display:none;"></span>
          </button>
        </form>

        <div style="text-align:center;margin-top:24px;color:var(--text-secondary);font-size:0.875rem;">
          <p><a href="/login" data-link style="color:var(--accent-primary);font-weight:500;">Back to Sign In</a></p>
        </div>
      </div>
    </div>
  `,

  init() {
    this.bindEvents();
    this.setupFloatingLabels();
  },

  bindEvents() {
    const form = document.getElementById('forgot-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleForgotPassword();
    });

    form.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => this.clearMessages());
      input.addEventListener('blur', () => this.updateLabel(input));
    });
  },

  setupFloatingLabels() {
    document.querySelectorAll('.input-group input').forEach(input => {
      if (input.value) input.parentElement.classList.add('has-value');
      input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
        if (!input.value) input.parentElement.classList.remove('has-value');
      });
    });
  },

  updateLabel(input) {
    if (input.value) input.parentElement.classList.add('has-value');
    else input.parentElement.classList.remove('has-value');
  },

  async handleForgotPassword() {
    const form = document.getElementById('forgot-form');
    const btn = document.getElementById('forgot-btn');
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');
    const errorDiv = document.getElementById('forgot-error');
    const successDiv = document.getElementById('forgot-success');

    const email = form.email.value.trim();

    if (!email) {
      this.showError('Please enter your email address');
      return;
    }

    btn.disabled = true;
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';
    this.clearMessages();

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        this.showSuccess(data.message || 'If an account exists, a reset link has been sent');
        form.reset();
        document.querySelectorAll('.input-group').forEach(g => g.classList.remove('has-value'));
      } else {
        this.showError(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      this.showError('Network error. Please try again.');
    } finally {
      btn.disabled = false;
      btnText.style.display = 'inline';
      loading.style.display = 'none';
    }
  },

  showError(message) {
    const errorDiv = document.getElementById('forgot-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'flex';
  },

  showSuccess(message) {
    const successDiv = document.getElementById('forgot-success');
    successDiv.textContent = message;
    successDiv.style.display = 'flex';
  },

  clearMessages() {
    document.getElementById('forgot-error').style.display = 'none';
    document.getElementById('forgot-success').style.display = 'none';
  }
};