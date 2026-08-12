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
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Create Account</h1>
          <p style="color:var(--text-secondary);">Join 500,000+ traders on BITOP</p>
        </div>

        <form id="register-form" novalidate>
          <div id="register-error" class="toast error" style="display:none;margin-bottom:20px;"></div>
          
          <div class="input-group" style="margin-bottom:20px;">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <input type="text" id="name" name="name" placeholder=" " required autocomplete="name">
            <label for="name">Full name</label>
          </div>

          <div class="input-group" style="margin-bottom:20px;">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            <input type="email" id="email" name="email" placeholder=" " required autocomplete="email">
            <label for="email">Email address</label>
          </div>

          <div class="input-group" style="margin-bottom:20px;">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M10 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <input type="password" id="password" name="password" placeholder=" " required autocomplete="new-password" minlength="6">
            <label for="password">Password</label>
            <button type="button" class="suffix" id="toggle-password" aria-label="Toggle password visibility" style="background:none;border:none;cursor:pointer;padding:4px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
          </div>

          <div class="input-group" style="margin-bottom:20px;">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M10 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <input type="password" id="confirmPassword" name="confirmPassword" placeholder=" " required autocomplete="new-password">
            <label for="confirmPassword">Confirm password</label>
          </div>

          <div class="input-group" style="margin-bottom:20px;">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <input type="text" id="referralCode" name="referralCode" placeholder=" " autocomplete="off" style="text-transform:uppercase;">
            <label for="referralCode">Referral code (optional)</label>
          </div>

          <div style="margin-bottom:24px;">
            <label class="flex-center gap-2" style="cursor:pointer;font-size:0.8125rem;color:var(--text-secondary);line-height:1.5;">
              <input type="checkbox" id="terms" name="terms" required style="width:18px;height:18px;accent-color:var(--accent-primary);flex-shrink:0;">
              <span>I agree to the <a href="/terms" data-link style="color:var(--accent-primary);">Terms of Service</a> and <a href="/privacy" data-link style="color:var(--accent-primary);">Privacy Policy</a></span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" id="register-btn" style="margin-bottom:24px;">
            <span class="btn-text">Create Account</span>
            <span class="loading" style="display:none;"></span>
          </button>
        </form>

        <div style="text-align:center;color:var(--text-secondary);font-size:0.875rem;">
          <p>Already have an account? <a href="/login" data-link style="color:var(--accent-primary);font-weight:500;">Sign in</a></p>
        </div>
      </div>
    </div>
  `,

  init() {
    this.bindEvents();
    this.setupFloatingLabels();
    this.checkReferralParam();
  },

  checkReferralParam() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      document.getElementById('referralCode').value = ref.toUpperCase();
      document.getElementById('referralCode').parentElement.classList.add('has-value');
    }
  },

  bindEvents() {
    const form = document.getElementById('register-form');
    const toggleBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
    toggleBtn.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      toggleBtn.innerHTML = type === 'password' 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleRegister();
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

  async handleRegister() {
    const form = document.getElementById('register-form');
    const btn = document.getElementById('register-btn');
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');
    const errorDiv = document.getElementById('register-error');

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const referralCode = form.referralCode.value.trim().toUpperCase();
    const terms = form.terms.checked;

    if (!name || !email || !password || !confirmPassword) {
      this.showError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      this.showError('Password must be at least 6 characters');
      return;
    }

    if (!terms) {
      this.showError('You must accept the Terms of Service');
      return;
    }

    btn.disabled = true;
    btnText.style.display = 'none';
    loading.style.display = 'inline-block';
    this.clearError();

    try {
      const { default: auth } = await import('../utils/auth.js');
      const response = await auth.register(name, email, password, referralCode);

      if (response.success) {
        window.location.href = '/dashboard';
      } else {
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          const messages = data.errors.map(e => e.msg || e.message).join(', ');
          this.showError(messages);
        } else {
          this.showError(data.message || 'Registration failed');
        }
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
    const errorDiv = document.getElementById('register-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'flex';
  },

  clearError() {
    const errorDiv = document.getElementById('register-error');
    errorDiv.style.display = 'none';
  }
};