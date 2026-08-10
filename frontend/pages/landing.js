export default {
  template: `
    <section class="hero" style="min-height:calc(100vh - var(--header-height) - var(--footer-height));display:flex;align-items:center;padding:100px 0;position:relative;overflow:hidden;">
      <div class="container">
        <div class="grid grid-2" style="gap:80px;align-items:center;">
          <div>
            <div class="flex-center gap-2" style="margin-bottom:24px;justify-content:flex-start;">
              <span class="badge badge-gold" style="font-size:0.75rem;padding:8px 16px;font-weight:600;">✨ New: Zero-fee trading for your first 30 days</span>
            </div>
            <h1 style="font-size:clamp(2.5rem,6vw,4.5rem);font-weight:800;line-height:1.05;margin-bottom:24px;letter-spacing:-0.02em;">
              Trade Crypto<br><span style="background:linear-gradient(135deg,#00d4ff 0%,#ffd700 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Like a Pro</span>
            </h1>
            <p style="font-size:1.25rem;color:var(--text-secondary);line-height:1.7;margin-bottom:40px;max-width:540px;">
              Institutional-grade infrastructure. Deep liquidity. Advanced tools. Join 500,000+ traders on the platform built for professionals.
            </p>
            <div class="flex-center gap-4 flex-wrap" style="margin-bottom:56px;">
              <a href="/register" data-link class="btn btn-primary btn-lg" style="padding:16px 32px;font-size:1.0625rem;font-weight:600;">Get Started</a>
              <a href="/markets" data-link class="btn btn-secondary btn-lg" style="padding:16px 32px;font-size:1.0625rem;font-weight:600;">Learn More</a>
            </div>
            <div class="flex-center gap-10 flex-wrap" style="color:var(--text-muted);font-size:0.875rem;">
              <div class="flex-center gap-2"><div class="status-dot success"></div><span>99.99% Uptime</span></div>
              <div class="flex-center gap-2"><div class="status-dot success"></div><span>Bank-grade Security</span></div>
              <div class="flex-center gap-2"><div class="status-dot success"></div><span>24/7 Support</span></div>
              <div class="flex-center gap-2"><div class="status-dot success"></div><span>Regulated & Licensed</span></div>
            </div>
          </div>
          
          <div class="relative" style="display:flex;justify-content:center;">
            <div style="position:relative;z-index:2;">
              <div class="hero-trading-panel" style="width:100%;max-width:580px;background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-xl),0 0 80px rgba(0,212,255,0.08);">
                <div style="padding:16px 20px;border-bottom:1px solid var(--border-muted);display:flex;align-items:center;justify-content:space-between;background:var(--bg-secondary);">
                  <div class="flex-center gap-2" style="color:var(--text-secondary);font-size:0.875rem;">
                    <span class="asset-badge">₿</span>
                    <span style="font-weight:600;">BTC/USDT</span>
                    <span class="badge badge-success" id="hero-price-change">+2.34%</span>
                  </div>
                  <div class="flex-center gap-1" id="hero-timeframes"></div>
                </div>
                <div id="hero-chart" style="height:340px;position:relative;"></div>
                <div style="padding:20px;border-top:1px solid var(--border-muted);display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                  <div class="flex-center gap-3" style="justify-content:flex-start;">
                    <div style="text-align:left;">
                      <p style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Price</p>
                      <p style="font-size:1.75rem;font-weight:700;font-family:var(--font-mono);" id="hero-price">$67,432.10</p>
                    </div>
                    <div style="width:1px;height:48px;background:var(--border-muted);"></div>
                    <div style="text-align:left;">
                      <p style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">24h Volume</p>
                      <p style="font-size:1.125rem;font-weight:600;font-family:var(--font-mono);color:var(--text-secondary);" id="hero-volume">$28.4B</p>
                    </div>
                  </div>
                  <div class="flex-center gap-3" style="justify-content:flex-end;">
                    <button class="btn btn-secondary btn-sm" style="width:100%;padding:12px;">Sell</button>
                    <button class="btn btn-primary btn-sm" style="width:100%;padding:12px;">Buy</button>
                  </div>
                </div>
              </div>
              
              <div class="live-price-strip" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:24px;" id="live-price-strip"></div>
            </div>
            
            <div class="absolute -bottom-8 -right-8" style="width:280px;height:280px;background:linear-gradient(135deg,var(--accent-primary),var(--gold-primary));border-radius:50%;opacity:0.08;filter:blur(80px);pointer-events:none;"></div>
            <div class="absolute -top-16 -left-16" style="width:200px;height:200px;background:linear-gradient(135deg,var(--gold-primary),var(--accent-primary));border-radius:50%;opacity:0.06;filter:blur(80px);pointer-events:none;"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="live-ticker" style="padding:24px 0;background:var(--bg-secondary);border-top:1px solid var(--border-muted);border-bottom:1px solid var(--border-muted);">
      <div class="container">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;" id="ticker-bar"></div>
      </div>
    </section>

    <section class="features" style="padding:100px 0;background:var(--bg-primary);">
      <div class="container">
        <div style="text-align:center;margin-bottom:64px;">
          <span class="badge badge-gold" style="font-size:0.75rem;padding:8px 16px;margin-bottom:16px;display:inline-block;">Why Traders Choose BITOP</span>
          <h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:16px;letter-spacing:-0.02em;">Built for Professionals</h2>
          <p style="font-size:1.125rem;color:var(--text-secondary);max-width:680px;margin:0 auto;line-height:1.7;">Every feature engineered to give you an edge in the markets.</p>
        </div>
        <div class="grid grid-3" style="gap:24px;" id="features-grid"></div>
      </div>
    </section>

    <section class="markets" style="padding:100px 0;background:var(--bg-secondary);border-top:1px solid var(--border-muted);border-bottom:1px solid var(--border-muted);">
      <div class="container">
        <div class="flex-between" style="margin-bottom:32px;align-items:center;flex-wrap:wrap;gap:16px;">
          <div>
            <h2 style="font-size:clamp(1.75rem,3vw,2.5rem);font-weight:800;letter-spacing:-0.02em;">Top Markets</h2>
            <p style="color:var(--text-secondary);margin-top:8px;">Real-time prices for the most traded assets</p>
          </div>
          <a href="/markets" data-link class="btn btn-ghost" style="padding:12px 24px;">View All Markets</a>
        </div>
        <div id="markets-table-container"></div>
      </div>
    </section>

    <section class="pricing" style="padding:100px 0;background:var(--bg-primary);border-top:1px solid var(--border-muted);">
      <div class="container">
        <div style="text-align:center;margin-bottom:64px;">
          <span class="badge badge-gold" style="font-size:0.75rem;padding:8px 16px;margin-bottom:16px;display:inline-block;">Simple, Transparent Pricing</span>
          <h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:16px;letter-spacing:-0.02em;">Choose Your Plan</h2>
          <p style="font-size:1.125rem;color:var(--text-secondary);max-width:680px;margin:0 auto;line-height:1.7;">Start free, upgrade as you grow. No hidden fees.</p>
        </div>
        <div class="grid grid-3" style="gap:24px;align-items:stretch;" id="pricing-grid"></div>
      </div>
    </section>

    <section class="cta" style="padding:120px 0;text-align:center;position:relative;overflow:hidden;background:var(--bg-primary);">
      <div class="container" style="position:relative;z-index:2;">
        <div style="max-width:700px;margin:0 auto;">
          <span class="badge badge-gold" style="font-size:0.75rem;padding:8px 16px;margin-bottom:24px;display:inline-block;">Get Started Today</span>
          <h2 style="font-size:clamp(2rem,4vw,3.5rem);font-weight:800;margin-bottom:24px;letter-spacing:-0.02em;">Start Trading Today</h2>
          <p style="font-size:1.25rem;color:var(--text-secondary);line-height:1.7;margin-bottom:40px;">Create your free account in minutes. No minimum deposit. Zero fees for 30 days.</p>
          <a href="/register" data-link class="btn btn-gold btn-xl" style="font-size:1.125rem;padding:20px 64px;font-weight:700;">Create Free Account</a>
          <p style="margin-top:24px;color:var(--text-muted);font-size:0.875rem;">By continuing, you agree to our <a href="/terms" data-link style="color:var(--accent-primary);">Terms of Service</a> and <a href="/privacy" data-link style="color:var(--accent-primary);">Privacy Policy</a>.</p>
        </div>
      </div>
      <div class="absolute top-0 left-0 right-0 bottom-0" style="background:radial-gradient(ellipse at center,rgba(0,212,255,0.06) 0%,transparent 70%);pointer-events:none;"></div>
    </section>
  `,

  async init() {
    this.renderLivePriceStrip();
    this.renderTickerBar();
    this.renderFeatures();
    this.renderPricing();
    this.renderMarketsTable();
    this.initHeroChart();
    this.startPriceUpdates();
  },

  renderLivePriceStrip() {
    const container = document.getElementById('live-price-strip');
    const assets = [
      { symbol: 'BTC', name: 'Bitcoin', price: 67432, change: 2.34, icon: '₿' },
      { symbol: 'ETH', name: 'Ethereum', price: 3456, change: -1.12, icon: 'Ξ' },
      { symbol: 'BNB', name: 'BNB', price: 589.45, change: 0.87, icon: '▶' },
      { symbol: 'SOL', name: 'Solana', price: 145.23, change: 5.67, icon: '◎' }
    ];

    container.innerHTML = assets.map(a => `
      <div class="price-card" style="background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-lg);padding:16px 20px;transition:all var(--transition-normal);">
        <div class="flex-between" style="align-items:flex-start;margin-bottom:8px;">
          <div class="flex-center gap-2">
            <span class="asset-badge-sm">${a.icon}</span>
            <span style="font-weight:600;font-size:0.875rem;">${a.symbol}</span>
          </div>
          <span class="badge ${a.change >= 0 ? 'badge-success' : 'badge-danger'}" style="font-size:0.6875rem;padding:4px 10px;">${a.change >= 0 ? '+' : ''}${a.change.toFixed(2)}%</span>
        </div>
        <div style="font-family:var(--font-mono);font-weight:700;font-size:1.125rem;">$${a.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
      </div>
    `).join('');
  },

  renderTickerBar() {
    const container = document.getElementById('ticker-bar');
    const assets = [
      { symbol: 'BTC', price: 67432, change: 2.34 },
      { symbol: 'ETH', price: 3456, change: -1.12 },
      { symbol: 'BNB', price: 589.45, change: 0.87 },
      { symbol: 'SOL', price: 145.23, change: 5.67 }
    ];

    container.innerHTML = assets.map(a => `
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:12px 16px;background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-lg);">
        <span style="font-weight:700;font-family:var(--font-mono);font-size:0.875rem;">${a.symbol}/USDT</span>
        <span style="font-weight:600;font-family:var(--font-mono);font-size:0.875rem;">$${a.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
        <span class="badge ${a.change >= 0 ? 'badge-success' : 'badge-danger'}" style="font-size:0.75rem;padding:6px 12px;">${a.change >= 0 ? '+' : ''}${a.change.toFixed(2)}%</span>
      </div>
    `).join('');
  },

  renderFeatures() {
    const features = [
      { 
        icon: '⚡', 
        title: 'Fast Trading', 
        desc: 'Sub-millisecond order execution with our custom matching engine handling 1M+ orders per second',
        highlight: '0.4ms avg latency'
      },
      { 
        icon: '🔒', 
        title: 'Secure Wallet', 
        desc: '95% cold storage, multi-sig vaults, 2FA, withdrawal whitelists, and regular penetration testing',
        highlight: 'SOC 2 Type II certified'
      },
      { 
        icon: '💬', 
        title: '24/7 Support', 
        desc: 'Round-the-clock multilingual support via live chat, email, and ticket system with <1min response',
        highlight: '98% satisfaction rate'
      }
    ];

    const grid = document.getElementById('features-grid');
    grid.innerHTML = features.map((f, i) => `
      <div class="feature-card" style="background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-xl);padding:40px 32px;transition:all var(--transition-normal);position:relative;overflow:hidden;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--accent-primary),var(--gold-primary));opacity:0;transition:opacity var(--transition-normal);"></div>
        <div style="width:72px;height:72px;border-radius:var(--radius-lg);background:linear-gradient(135deg,rgba(0,212,255,0.15),rgba(255,215,0,0.15));display:flex;align-items:center;justify-content:center;margin:0 0 24px;font-size:1.75rem;">${f.icon}</div>
        <span class="badge badge-gold" style="font-size:0.625rem;padding:4px 10px;margin-bottom:16px;display:inline-block;">${f.highlight}</span>
        <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:12px;letter-spacing:-0.01em;">${f.title}</h3>
        <p style="color:var(--text-secondary);font-size:0.9375rem;line-height:1.7;">${f.desc}</p>
      </div>
    `).join('');

    // Add hover effects
    grid.querySelectorAll('.feature-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.borderColor = 'var(--accent-primary)';
        card.style.boxShadow = 'var(--shadow-xl), 0 0 40px rgba(0,212,255,0.1)';
        card.querySelector('[style*="height:3px"]').style.opacity = '1';
        card.style.transform = 'translateY(-4px)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = 'var(--border-muted)';
        card.style.boxShadow = 'none';
        card.querySelector('[style*="height:3px"]').style.opacity = '0';
        card.style.transform = 'translateY(0)';
      });
    });
  },

  renderPricing() {
    const grid = document.getElementById('pricing-grid');
    const plans = [
      {
        name: 'Starter',
        price: 0,
        period: '/month',
        description: 'Perfect for beginners',
        features: [
          'Spot trading with 0.1% fee',
          'Access to 100+ markets',
          'Basic charting tools',
          'Email support',
          '2FA security',
          'Mobile app access'
        ],
        cta: 'Start Free',
        variant: 'secondary',
        popular: false
      },
      {
        name: 'Pro',
        price: 29,
        period: '/month',
        description: 'For active traders',
        features: [
          'Spot trading with 0.05% fee',
          'Futures & margin trading',
          'Advanced charting & indicators',
          'Priority 24/7 support',
          'API access (100 req/s)',
          'TradingView integration',
          'Custom alerts & bots',
          'Fee rebates on volume'
        ],
        cta: 'Go Pro',
        variant: 'primary',
        popular: true
      },
      {
        name: 'Institutional',
        price: 199,
        period: '/month',
        description: 'For funds & teams',
        features: [
          'Custom fee tiers (as low as 0.01%)',
          'Dedicated account manager',
          'Unlimited API rate limits',
          'Co-location & FIX API',
          'OTC desk access',
          'White-glove onboarding',
          'Custom reporting & analytics',
          'SLA guarantee (99.99%)',
          'Multi-subaccount management'
        ],
        cta: 'Contact Sales',
        variant: 'gold',
        popular: false
      }
    ];

    grid.innerHTML = plans.map((plan, i) => `
      <div class="pricing-card" style="
        background:var(--bg-card);
        border:1px solid ${plan.popular ? 'var(--accent-primary)' : 'var(--border-muted)'};
        border-radius:var(--radius-xl);
        padding:40px 32px;
        transition:all var(--transition-normal);
        position:relative;
        display:flex;
        flex-direction:column;
        ${plan.popular ? 'box-shadow:var(--shadow-xl),0 0 40px rgba(0,212,255,0.1);' : ''}
      ">
        ${plan.popular ? '<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--accent-primary),var(--gold-primary));color:#000;padding:4px 16px;border-radius:var(--radius-full);font-size:0.75rem;font-weight:700;">Most Popular</div>' : ''}
        <div style="margin-bottom:24px;">
          <h3 style="font-size:1.25rem;font-weight:700;margin-bottom:8px;">${plan.name}</h3>
          <p style="color:var(--text-secondary);font-size:0.9375rem;">${plan.description}</p>
        </div>
        <div style="margin-bottom:8px;">
          <span style="font-size:clamp(2.5rem,5vw,3.5rem);font-weight:800;font-family:var(--font-mono);letter-spacing:-0.02em;">$${plan.price}</span>
          <span style="color:var(--text-muted);font-size:1rem;font-weight:400;font-family:var(--font-sans);">${plan.period}</span>
        </div>
        <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:32px;">${plan.price === 0 ? 'No credit card required' : 'Billed monthly, cancel anytime'}</p>
        <ul style="list-style:none;margin-bottom:32px;flex:1;">
          ${plan.features.map(f => `
            <li style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-muted);">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink:0;margin-top:2px;color:var(--success);"><path d="M16.667 4.167L7.5 13.333 3.333 9.167" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span style="color:var(--text-secondary);font-size:0.9375rem;line-height:1.5;">${f}</span>
            </li>
          `).join('')}
        </ul>
        <a href="${plan.price === 0 ? '/register' : plan.price === 29 ? '/register?plan=pro' : '/contact'}" data-link class="btn btn-${plan.variant} btn-full" style="padding:14px 24px;font-size:1rem;font-weight:600;">${plan.cta}</a>
      </div>
    `).join('');
  },

  renderMarketsTable() {
    const container = document.getElementById('markets-table-container');
    const markets = [
      { symbol: 'BTC/USDT', name: 'Bitcoin', price: 67432.10, change: 2.34, marketCap: 1.32e12 },
      { symbol: 'ETH/USDT', name: 'Ethereum', price: 3456.78, change: -1.12, marketCap: 415e9 },
      { symbol: 'BNB/USDT', name: 'BNB', price: 589.45, change: 0.87, marketCap: 91e9 },
      { symbol: 'SOL/USDT', name: 'Solana', price: 145.23, change: 5.67, marketCap: 67e9 },
      { symbol: 'XRP/USDT', name: 'XRP', price: 0.5234, change: -0.45, marketCap: 28e9 }
    ];

    container.innerHTML = `
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:separate;border-spacing:0 8px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:16px 20px;font-weight:600;color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;">Coin</th>
              <th style="text-align:right;padding:16px 20px;font-weight:600;color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
              <th style="text-align:right;padding:16px 20px;font-weight:600;color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;">24h Change</th>
              <th style="text-align:right;padding:16px 20px;font-weight:600;color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;">Market Cap</th>
              <th style="text-align:center;padding:16px 20px;font-weight:600;color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${markets.map(m => `
              <tr style="background:var(--bg-card);border:1px solid var(--border-muted);transition:all var(--transition-fast);">
                <td style="padding:16px 20px;">
                  <div class="flex-center gap-3">
                    <span class="asset-badge">${m.symbol === 'BTC/USDT' ? '₿' : m.symbol === 'ETH/USDT' ? 'Ξ' : m.symbol[0]}</span>
                    <div>
                      <p style="font-weight:600;">${m.symbol}</p>
                      <p style="font-size:0.75rem;color:var(--text-muted);">${m.name}</p>
                    </div>
                  </div>
                </td>
                <td style="padding:16px 20px;font-family:var(--font-mono);font-weight:600;font-size:1.0625rem;text-align:right;">$${m.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: m.price < 1 ? 6 : 2})}</td>
                <td style="padding:16px 20px;text-align:right;">
                  <span class="badge ${m.change >= 0 ? 'badge-success' : 'badge-danger'}" style="font-size:0.8125rem;padding:6px 14px;">${m.change >= 0 ? '+' : ''}${m.change.toFixed(2)}%</span>
                </td>
                <td style="padding:16px 20px;text-align:right;font-family:var(--font-mono);color:var(--text-secondary);">$${this.formatMarketCap(m.marketCap)}</td>
                <td style="padding:16px 20px;text-align:center;"><a href="/trade?pair=${m.symbol}" data-link class="btn btn-primary btn-sm">Trade</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  formatMarketCap(cap) {
    if (cap >= 1e12) return (cap / 1e12).toFixed(2) + 'T';
    if (cap >= 1e9) return (cap / 1e9).toFixed(1) + 'B';
    if (cap >= 1e6) return (cap / 1e6).toFixed(1) + 'M';
    return cap.toFixed(0);
  },

  initHeroChart() {
    const canvas = document.createElement('canvas');
    canvas.id = 'hero-chart-canvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    document.getElementById('hero-chart').appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    this.heroChartCtx = ctx;
    this.heroChartRect = rect;
    this.drawHeroChart();
    
    // Timeframe buttons
    const tfContainer = document.getElementById('hero-timeframes');
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
    tfContainer.innerHTML = timeframes.map(tf => `
      <button class="tab-btn ${tf === '1h' ? 'btn-primary' : 'btn-ghost'} btn-xs" data-tf="${tf}" style="padding:6px 12px;">${tf}</button>
    `).join('');
    tfContainer.querySelectorAll('[data-tf]').forEach(btn => {
      btn.addEventListener('click', () => {
        tfContainer.querySelectorAll('[data-tf]').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-ghost');
        });
        btn.classList.remove('btn-ghost');
        btn.classList.add('btn-primary');
        this.drawHeroChart();
      });
    });
  },

  drawHeroChart() {
    const ctx = this.heroChartCtx;
    const rect = this.heroChartRect;
    if (!ctx || !rect) return;
    
    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 60, bottom: 30, left: 50 };
    const cw = w - padding.left - padding.right;
    const ch = h - padding.top - padding.bottom;
    
    const points = 120;
    const data = [];
    let basePrice = 67000;
    for (let i = 0; i < points; i++) {
      basePrice += (Math.random() - 0.48) * 150;
      data.push(basePrice);
    }
    
    const minPrice = Math.min(...data);
    const maxPrice = Math.max(...data);
    const priceRange = maxPrice - minPrice || 1;
    
    ctx.clearRect(0, 0, w, h);
    
    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * ch;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const x = padding.left + (i / 5) * cw;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, h - padding.bottom);
      ctx.stroke();
    }
    
    // Area gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
    
    ctx.beginPath();
    ctx.moveTo(padding.left, h - padding.bottom - (data[0] - minPrice) / priceRange * ch);
    for (let i = 1; i < points; i++) {
      const x = padding.left + (i / (points - 1)) * cw;
      const y = h - padding.bottom - (data[i] - minPrice) / priceRange * ch;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(padding.left + cw, h - padding.bottom);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Line
    ctx.beginPath();
    ctx.moveTo(padding.left, h - padding.bottom - (data[0] - minPrice) / priceRange * ch);
    for (let i = 1; i < points; i++) {
      const x = padding.left + (i / (points - 1)) * cw;
      const y = h - padding.bottom - (data[i] - minPrice) / priceRange * ch;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // Price labels
    ctx.fillStyle = '#64748b';
    ctx.font = '11px "JetBrains Mono"';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const price = maxPrice - (i / 4) * priceRange;
      const y = padding.top + (i / 4) * ch;
      ctx.fillText(price.toLocaleString(undefined, {maximumFractionDigits: 0}), padding.left - 12, y + 4);
    }
    
    // Time labels
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const idx = Math.floor((i / 5) * (points - 1));
      const x = padding.left + (i / 5) * cw;
      ctx.fillText(`${Math.floor((points - idx) / 60)}h ago`, x, h - padding.bottom + 18);
    }
    
    // Current price badge
    const lastPrice = data[data.length - 1];
    const priceY = h - padding.bottom - (lastPrice - minPrice) / priceRange * ch;
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 13px "JetBrains Mono"';
    ctx.textAlign = 'left';
    ctx.fillText('$' + lastPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}), w - padding.right + 12, priceY + 5);
    
    // Update price display
    document.getElementById('hero-price').textContent = '$' + lastPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const change = ((lastPrice - data[0]) / data[0] * 100).toFixed(2);
    document.getElementById('hero-price-change').textContent = (change >= 0 ? '+' : '') + change + '%';
    document.getElementById('hero-price-change').className = 'badge ' + (change >= 0 ? 'badge-success' : 'badge-danger');
    document.getElementById('hero-volume').textContent = '$' + this.formatVolume((Math.random() * 20 + 15) * 1e9);
  },

  formatVolume(vol) {
    if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B';
    if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M';
    if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
    return vol.toFixed(0);
  },

  startPriceUpdates() {
    this.priceInterval = setInterval(() => {
      this.renderLivePriceStrip();
      this.renderTickerBar();
      this.renderMarketsTable();
    }, 15000);
  },

  destroy() {
    if (this.priceInterval) clearInterval(this.priceInterval);
  }
};