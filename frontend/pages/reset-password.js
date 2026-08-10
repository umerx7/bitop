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
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Reset Password</h1>
          <p style="color:var(--text-secondary);">Enter your new password below</p>
        </div>

        <form id="reset-form" novalidate>
          <div id="reset-error" class="toast error" style="display:none;margin-bottom:20px;"></div>
          
          <div class="input-group" style="margin-bottom:20px;">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M10 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <input type="password" id="password" name="password" placeholder="New password (min 8 chars, upper, lower, number, special)" required autocomplete="new-password" style="width:100%;" minlength="8">
            <label for="password" style="position:absolute;left:44px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;transition:all var(--transition-fast);font-size:0.875rem;">New password</label>
            <button type="button" class="suffix" id="toggle-password" aria-label="Toggle password visibility" style="background:none;border:none;cursor:pointer;padding:4px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
          </div>

          <div class="input-group" style="margin-bottom:24px;">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M10 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm new password" required autocomplete="new-password" style="width:100%;">
            <label for="confirmPassword" style="position:absolute;left:44px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;transition:all var(--transition-fast);font-size:0.875rem;">Confirm password</label>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" id="reset-btn" style="margin-bottom:24px;">
            <span class="btn-text">Reset Password</span>
            <span class="loading" style="display:none;"></span>
          </button>
        </form>

        <div style="text-align:center;color:var(--text-secondary);font-size:0.875rem;">
          <p><a href="/login" data-link style="color:var(--accent-primary);font-weight:500;">Back to Sign In</a></p>
        </div>
      </div>
    </div>
  `,

  init() {
    this.bindEvents();
    this.setupFloatingLabels();
    this.checkToken();
  },

  checkToken() {
    const token = window.location.pathname.split('/').pop();
    if (!token || token === 'reset-password') {
      document.getElementById('reset-form').style.display = 'none';
      document.getElementById('reset-error').textContent = 'Invalid or missing reset token';
      document.getElementById('reset-error').style.display = 'flex';
    }
  },

  bindEvents() {
    const form = document.getElementById('reset-form');
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
    if (toggleBtn && passwordInput) {
      toggleBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        toggleBtn.innerHTML = type === 'password' 
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleResetPassword();
    });

    form.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => this.clearError());
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

  async handleResetPassword() {
    const form = document.getElementById('reset-form');
    const btn = document.getElementById('reset-btn');
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');
    const errorDiv = document.getElementById('reset-error');

    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const token = window.location.pathname.split('/').pop();

    if (!password || !confirmPassword) {
      this.showError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      this.showError('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[@$!%*?&]/.test(password)) {
      this.showError('Password must contain uppercase, lowercase, number, and special character');
      return;
    }

    btn.disabled = true;
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';
    this.clearError();

    try {
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('bitop_token', data.token);
        localStorage.setItem('bitop_refresh_token', data.refreshToken);
        localStorage.setItem('bitop_user', JSON.stringify(data.user));
        
        window.location.href = '/dashboard';
      } else {
        this.showError(data.message || 'Password reset failed');
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
    const errorDiv = document.getElementById('reset-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'flex';
  },

  clearError() {
    document.getElementById('reset-error').style.display = 'none';
  }
};