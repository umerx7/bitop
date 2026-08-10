export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div style="margin-bottom:32px;">
          <h1 style="font-size:2rem;font-weight:800;margin-bottom:8px;">Help Center</h1>
          <p style="color:var(--text-secondary);">Find answers to common questions</p>
        </div>

        <div class="card" style="margin-bottom:24px;">
          <div style="padding:24px;">
            <div class="input-group" style="max-width:500px;">
              <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" id="faq-search" placeholder="Search help articles..." style="width:100%;padding-left:44px;font-size:1rem;">
            </div>
          </div>
        </div>

        <div class="grid grid-3" style="gap:16px;margin-bottom:32px;">
          <a href="#account" class="card faq-category" style="padding:24px;text-align:center;text-decoration:none;transition:all var(--transition-fast);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="1.5" style="margin:0 auto 16px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <h3 style="font-weight:600;margin-bottom:8px;">Account & Security</h3>
            <p style="color:var(--text-secondary);font-size:0.875rem;">Login, 2FA, verification, passwords</p>
          </a>
          <a href="#trading" class="card faq-category" style="padding:24px;text-align:center;text-decoration:none;transition:all var(--transition-fast);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="1.5" style="margin:0 auto 16px;"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
            <h3 style="font-weight:600;margin-bottom:8px;">Trading</h3>
            <p style="color:var(--text-secondary);font-size:0.875rem;">Orders, fees, pairs, charts</p>
          </a>
          <a href="#wallet" class="card faq-category" style="padding:24px;text-align:center;text-decoration:none;transition:all var(--transition-fast);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="1.5" style="margin:0 auto 16px;"><path d="M21 12V7H5"></path><path d="M3 21h18"></path><path d="M5 7l3 3 8-8"></path></svg>
            <h3 style="font-weight:600;margin-bottom:8px;">Deposits & Withdrawals</h3>
            <p style="color:var(--text-secondary);font-size:0.875rem;">Funding, networks, limits, fees</p>
          </a>
        </div>

        <div id="faq-content">
          <section id="account" style="margin-bottom:48px;">
            <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid var(--border-muted);">Account & Security</h2>
            <div class="faq-list" style="display:flex;flex-direction:column;gap:12px;">
              ${this.renderFAQ('How do I create an account?', 'Click "Get Started" on the homepage, enter your email and password, then verify your email address. You\'ll need to complete KYC verification for full access.')}
              ${this.renderFAQ('I forgot my password. How do I reset it?', 'Click "Forgot Password" on the login page, enter your registered email, and follow the reset link sent to your inbox.')}
              ${this.renderFAQ('How do I enable two-factor authentication (2FA)?', 'Go to Settings → Security, click "Enable" under Authenticator App, scan the QR code with Google Authenticator or Authy, and enter the 6-digit code.')}
              ${this.renderFAQ('What is KYC verification and why is it required?', 'KYC (Know Your Customer) is a regulatory requirement to verify your identity. It helps prevent fraud, money laundering, and enables higher withdrawal limits.')}
              ${this.renderFAQ('How long does verification take?', 'Basic verification is instant. Identity verification typically takes 5-30 minutes during business hours, but can take up to 24 hours during high volume.')}
              ${this.renderFAQ('My account is locked. What should I do?', 'Accounts lock after 5 failed login attempts. Wait 30 minutes or use "Forgot Password" to reset. Contact support if the issue persists.')}
            </div>
          </section>

          <section id="trading" style="margin-bottom:48px;">
            <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid var(--border-muted);">Trading</h2>
            <div class="faq-list" style="display:flex;flex-direction:column;gap:12px;">
              ${this.renderFAQ('What order types are available?', 'We support Market, Limit, and Stop-Limit orders. Market orders execute immediately at best price. Limit orders execute at your specified price or better. Stop-Limit orders trigger a limit order when the stop price is reached.')}
              ${this.renderFAQ('What are the trading fees?', 'Standard fee is 0.1% for both makers and takers. VIP users and referral program participants can earn reduced fees down to 0.02%. Zero-fee trading for new users\' first 30 days.' )}
              ${this.renderFAQ('What is the minimum order size?', 'Minimum order sizes vary by trading pair. For BTC/USDT it\'s 0.00001 BTC. Check the trading page for specific pair minimums.')}
              ${this.renderFAQ('How do I read the order book?', 'The order book shows buy orders (bids) in green and sell orders (asks) in red. Price levels are aggregated. The spread is the difference between best bid and best ask.')}
              ${this.renderFAQ('What are maker and taker fees?', 'Maker fees apply when you add liquidity (limit orders not immediately matched). Taker fees apply when you remove liquidity (market orders or limit orders that cross the spread).'})
              ${this.renderFAQ('Can I use trading bots/API?', 'Yes! We provide REST and WebSocket APIs with comprehensive documentation. Create API keys in Settings → API Keys. Rate limits apply based on your tier.')}
            </div>
          </section>

          <section id="wallet" style="margin-bottom:48px;">
            <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid var(--border-muted);">Deposits & Withdrawals</h2>
            <div class="faq-list" style="display:flex;flex-direction:column;gap:12px;">
              ${this.renderFAQ('How do I deposit cryptocurrency?', 'Go to Wallet → Deposit, select the asset and network, copy the deposit address (and memo if required), and send from your external wallet. Always double-check the network matches.' )}
              ${this.renderFAQ('Why is my deposit not showing?', 'Deposits require network confirmations (1-6 depending on asset). Check the transaction hash on a block explorer. If confirmations are complete but not credited, contact support with the tx hash.' )}
              ${this.renderFAQ('What networks are supported for deposits/withdrawals?', 'We support multiple networks per asset (e.g., BTC: Bitcoin, Lightning; ETH: Ethereum, Arbitrum, Optimism; USDT: ERC20, TRC20, BEP20, Polygon). Check the deposit page for current networks.' )}
              ${this.renderFAQ('What are the withdrawal fees and limits?', 'Fees vary by asset and network (e.g., BTC: 0.0005 BTC, ETH: 0.003 ETH). Minimum and maximum limits apply per network. VIP users enjoy higher limits and lower fees.' )}
              ${this.renderFAQ('How long do withdrawals take?', 'Most withdrawals process within minutes. Large withdrawals may require manual review (up to 24 hours). Network congestion can delay on-chain confirmation.' )}
              ${this.renderFAQ('Can I cancel a withdrawal?', 'Only if status is "Pending" and not yet broadcast to the network. Go to Wallet → History, find the withdrawal, and click "Cancel" if available.' )}
            </div>
          </section>
        </div>

        <div class="card" style="text-align:center;padding:48px;">
          <h3 style="font-weight:600;margin-bottom:12px;">Still Need Help?</h3>
          <p style="color:var(--text-secondary);margin-bottom:24px;">Our support team is available 24/7</p>
          <a href="/chat" data-link class="btn btn-primary btn-lg">Contact Support</a>
        </div>
      </div>
    </div>
  `,

  renderFAQ(question, answer) {
    return `
      <div class="card faq-item" style="overflow:hidden;">
        <button class="faq-question" style="width:100%;padding:20px;text-align:left;background:none;border:none;display:flex;justify-content:space-between;align-items:center;cursor:pointer;font-weight:500;font-size:1rem;">
          <span>${question}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition:transform var(--transition-fast);"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="faq-answer" style="max-height:0;overflow:hidden;transition:max-height var(--transition-normal);">
          <div style="padding:0 20px 20px;color:var(--text-secondary);line-height:1.7;">${answer}</div>
        </div>
      </div>
    `;
  },

  init() {
    // Initialize FAQ accordion
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const answer = item.querySelector('.faq-answer');
        const icon = btn.querySelector('svg');
        const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
        
        if (isOpen) {
          answer.style.maxHeight = '0px';
          icon.style.transform = 'rotate(0deg)';
        } else {
          answer.style.maxHeight = answer.scrollHeight + 'px';
          icon.style.transform = 'rotate(180deg)';
        }
      });
    });

    // Search filter
    const searchInput = document.getElementById('faq-search');
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      document.querySelectorAll('.faq-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });

    // Smooth scroll for category links
    document.querySelectorAll('.faq-category').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }
};