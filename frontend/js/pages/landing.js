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
              Trade Crypto with<br><span style="background:linear-gradient(135deg,#00d4ff 0%,#ffd700 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Confidence & Speed</span>
            </h1>
            <p style="font-size:1.25rem;color:var(--text-secondary);line-height:1.7;margin-bottom:40px;max-width:540px;">
              Institutional-grade infrastructure. Deep liquidity. Advanced tools. Join 500,000+ traders on the platform built for professionals.
            </p>
            <div class="flex-center gap-4 flex-wrap" style="margin-bottom:56px;">
              <a href="/register" data-link class="btn btn-primary btn-lg" style="padding:16px 32px;font-size:1.0625rem;font-weight:600;">Start Trading Free</a>
              <a href="/markets" data-link class="btn btn-secondary btn-lg" style="padding:16px 32px;font-size:1.0625rem;font-weight:600;">Explore Markets</a>
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

    <section class="trending-assets" style="padding:60px 0;background:var(--bg-secondary);border-top:1px solid var(--border-muted);border-bottom:1px solid var(--border-muted);">
      <div class="container">
        <div class="flex-between" style="margin-bottom:24px;align-items:center;flex-wrap:wrap;gap:16px;">
          <h2 style="font-size:1.5rem;font-weight:700;">Top Movers</h2>
          <div class="flex-center gap-2" id="trending-tabs"></div>
        </div>
        <div class="grid grid-4" style="gap:16px;" id="trending-cards"></div>
      </div>
    </section>

    <section class="features" style="padding:120px 0;background:var(--bg-primary);">
      <div class="container">
        <div style="text-align:center;margin-bottom:80px;">
          <span class="badge badge-gold" style="font-size:0.75rem;padding:8px 16px;margin-bottom:16px;display:inline-block;">Why 500,000+ Traders Choose BITOP</span>
          <h2 style="font-size:clamp(2rem,4vw,3.5rem);font-weight:800;margin-bottom:16px;letter-spacing:-0.02em;">Built for Professionals</h2>
          <p style="font-size:1.125rem;color:var(--text-secondary);max-width:680px;margin:0 auto;line-height:1.7;">Every feature engineered to give you an edge in the markets.</p>
        </div>
        <div class="grid grid-3" style="gap:24px;" id="features-grid"></div>
      </div>
    </section>

    <section class="stats" style="padding:100px 0;background:var(--bg-secondary);border-top:1px solid var(--border-muted);border-bottom:1px solid var(--border-muted);">
      <div class="container">
        <div class="grid grid-4" style="gap:32px;text-align:center;" id="stats-grid"></div>
      </div>
    </section>

    <section class="platform-preview" style="padding:120px 0;background:var(--bg-primary);">
      <div class="container">
        <div class="grid grid-2" style="gap:80px;align-items:center;">
          <div>
            <span class="badge badge-primary" style="font-size:0.75rem;padding:8px 16px;margin-bottom:16px;display:inline-block;">Platform</span>
            <h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:24px;letter-spacing:-0.02em;">Trade on the Most Advanced Platform</h2>
            <p style="font-size:1.125rem;color:var(--text-secondary);line-height:1.7;margin-bottom:32px;max-width:500px;">
              Professional trading interface with TradingView charts, 100+ indicators, multiple order types, and lightning-fast execution.
            </p>
            <div class="flex-center gap-4 flex-wrap" style="margin-bottom:32px;">
              <div class="flex-center gap-3" style="padding:16px 24px;background:var(--bg-secondary);border:1px solid var(--border-muted);border-radius:var(--radius-lg);">
                <div class="status-dot success" style="width:10px;height:10px;"></div>
                <span style="font-weight:500;">Sub-millisecond execution</span>
              </div>
              <div class="flex-center gap-3" style="padding:16px 24px;background:var(--bg-secondary);border:1px solid var(--border-muted);border-radius:var(--radius-lg);">
                <div class="status-dot success" style="width:10px;height:10px;"></div>
                <span style="font-weight:500;">Advanced order types</span>
              </div>
            </div>
            <a href="/trade" data-link class="btn btn-primary btn-lg" style="padding:16px 40px;">Launch Trading Terminal</a>
          </div>
          <div class="relative" style="border-radius:var(--radius-xl);overflow:hidden;border:1px solid var(--border-muted);background:var(--bg-card);box-shadow:var(--shadow-xl);">
            <div style="padding:16px 20px;border-bottom:1px solid var(--border-muted);background:var(--bg-secondary);display:flex;align-items:center;justify-content:space-between;">
              <div class="flex-center gap-2" style="color:var(--text-secondary);font-size:0.8125rem;">
                <span class="asset-badge">₿</span>
                <span>BTC/USDT</span>
                <span class="badge badge-success">+2.34%</span>
              </div>
              <div class="flex-center gap-1">
                <button class="btn btn-ghost btn-xs">1m</button>
                <button class="btn btn-ghost btn-xs">5m</button>
                <button class="btn btn-ghost btn-xs btn-primary">1h</button>
                <button class="btn btn-ghost btn-xs">1d</button>
              </div>
            </div>
            <div id="platform-chart" style="height:380px;position:relative;"></div>
            <div style="padding:20px;border-top:1px solid var(--border-muted);display:grid;grid-template-columns:repeat(4,1fr);gap:12px;text-align:center;">
              <div><p style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">High</p><p style="font-family:var(--font-mono);font-weight:600;">$68,200</p></div>
              <div><p style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Low</p><p style="font-family:var(--font-mono);font-weight:600;">$65,100</p></div>
              <div><p style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Volume</p><p style="font-family:var(--font-mono);font-weight:600;">28.4K</p></div>
              <div><p style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;">Spread</p><p style="font-family:var(--font-mono);font-weight:600;color:var(--success)">$0.01</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="security" style="padding:100px 0;background:var(--bg-secondary);border-top:1px solid var(--border-muted);">
      <div class="container">
        <div style="text-align:center;margin-bottom:64px;">
          <span class="badge badge-gold" style="font-size:0.75rem;padding:8px 16px;margin-bottom:16px;display:inline-block;">Security First</span>
          <h2 style="font-size:clamp(2rem,4vw,3rem);font-weight:800;margin-bottom:16px;">Your Assets, Protected</h2>
          <p style="font-size:1.125rem;color:var(--text-secondary);max-width:600px;margin:0 auto;">Enterprise-grade security infrastructure trusted by institutions worldwide.</p>
        </div>
        <div class="grid grid-4" style="gap:24px;" id="security-grid"></div>
      </div>
    </section>

    <section class="cta" style="padding:120px 0;text-align:center;position:relative;overflow:hidden;">
      <div class="container" style="position:relative;z-index:2;">
        <div style="max-width:700px;margin:0 auto;">
          <span class="badge badge-gold" style="font-size:0.75rem;padding:8px 16px;margin-bottom:24px;display:inline-block;">Get Started Today</span>
          <h2 style="font-size:clamp(2rem,4vw,3.5rem);font-weight:800;margin-bottom:24px;letter-spacing:-0.02em;">Ready to Trade Like a Pro?</h2>
          <p style="font-size:1.25rem;color:var(--text-secondary);line-height:1.7;margin-bottom:40px;">Create your free account in minutes. No minimum deposit. Zero fees for 30 days.</p>
          <a href="/register" data-link class="btn btn-gold btn-xl" style="font-size:1.125rem;padding:20px 64px;font-weight:700;">Create Free Account</a>
          <p style="margin-top:24px;color:var(--text-muted);font-size:0.875rem;">By continuing, you agree to our <a href="/terms" data-link style="color:var(--accent-primary);">Terms of Service</a> and <a href="/privacy" data-link style="color:var(--accent-primary);">Privacy Policy</a>.</p>
        </div>
      </div>
      <div class="absolute top-0 left-0 right-0 bottom-0" style="background:radial-gradient(ellipse at center,rgba(0,212,255,0.06) 0%,transparent 70%);pointer-events:none;"></div>
    </section>
  `,

  async init() {
    this.renderFeatures();
    this.renderStats();
    this.renderSecurity();
    this.renderLivePriceStrip();
    this.renderTrendingAssets();
    await this.renderMarketsTable();
    this.initHeroChart();
    this.initPlatformChart();
    this.startPriceUpdates();
  },

  renderLivePriceStrip() {
    const container = document.getElementById('live-price-strip');
    const assets = [
      { symbol: 'BTC', name: 'Bitcoin', price: 67432, change: 2.34, icon: '₿' },
      { symbol: 'ETH', name: 'Ethereum', price: 3456, change: -1.12, icon: 'Ξ' },
      { symbol: 'SOL', name: 'Solana', price: 145.23, change: 5.67, icon: '◎' },
      { symbol: 'GOLD', name: 'Digital Gold', price: 2045.80, change: 0.45, icon: '🥇' }
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

  renderTrendingAssets() {
    const tabsContainer = document.getElementById('trending-tabs');
    const tabs = ['Gainers', 'Losers', 'Volume', 'New'];
    tabsContainer.innerHTML = tabs.map((t, i) => `
      <button class="tab-btn ${i === 0 ? 'btn-primary' : 'btn-ghost'} btn-sm" data-trending="${t.toLowerCase()}" style="padding:8px 16px;">${t}</button>
    `).join('');

    tabsContainer.querySelectorAll('[data-trending]').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsContainer.querySelectorAll('[data-trending]').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-ghost');
        });
        btn.classList.remove('btn-ghost');
        btn.classList.add('btn-primary');
        this.renderTrendingCards(btn.dataset.trending);
      });
    });

    this.renderTrendingCards('gainers');
  },

  renderTrendingCards(type) {
    const container = document.getElementById('trending-cards');
    const allAssets = [
      { symbol: 'SOL', name: 'Solana', price: 145.23, change: 12.45, volume: 1.2e9 },
      { symbol: 'AVAX', name: 'Avalanche', price: 36.78, change: 8.92, volume: 845e6 },
      { symbol: 'LINK', name: 'Chainlink', price: 18.45, change: 6.23, volume: 612e6 },
      { symbol: 'ARB', name: 'Arbitrum', price: 1.23, change: 5.67, volume: 423e6 },
      { symbol: 'DOGE', name: 'Dogecoin', price: 0.156, change: -4.23, volume: 2.1e9 },
      { symbol: 'SHIB', name: 'Shiba Inu', price: 0.000021, change: -3.89, volume: 1.8e9 },
      { symbol: 'PEPE', name: 'Pepe', price: 0.0000012, change: -5.12, volume: 945e6 },
      { symbol: 'FLOKI', name: 'Floki', price: 0.00018, change: -2.67, volume: 567e6 },
    ];

    let assets = [...allAssets];
    if (type === 'gainers') assets.sort((a, b) => b.change - a.change);
    else if (type === 'losers') assets.sort((a, b) => a.change - b.change);
    else if (type === 'volume') assets.sort((a, b) => b.volume - a.volume);
    else assets = assets.slice(0, 4);

    container.innerHTML = assets.slice(0, 4).map(a => `
      <div class="trending-card" style="background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-xl);padding:20px;transition:all var(--transition-normal);">
        <div class="flex-between" style="align-items:flex-start;margin-bottom:12px;">
          <div class="flex-center gap-2">
            <span class="asset-badge">${a.symbol === 'BTC' ? '₿' : a.symbol === 'ETH' ? 'Ξ' : a.symbol[0]}</span>
            <div>
              <p style="font-weight:600;">${a.symbol}</p>
              <p style="font-size:0.75rem;color:var(--text-muted);">${a.name}</p>
            </div>
          </div>
          <span class="badge ${a.change >= 0 ? 'badge-success' : 'badge-danger'}" style="font-size:0.6875rem;padding:6px 12px;">${a.change >= 0 ? '+' : ''}${a.change.toFixed(2)}%</span>
        </div>
        <div style="margin-bottom:12px;">
          <p style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Price</p>
          <p style="font-family:var(--font-mono);font-weight:700;font-size:1.25rem;">$${a.price.toLocaleString(undefined, {minimumFractionDigits: a.price < 1 ? 6 : 2})}</p>
        </div>
        <div class="flex-between" style="padding-top:12px;border-top:1px solid var(--border-muted);">
          <span style="font-size:0.75rem;color:var(--text-secondary);">Vol: $${this.formatVolume(a.volume)}</span>
          <a href="/trade?pair=${a.symbol}/USDT" data-link class="btn btn-ghost btn-xs btn-primary">Trade</a>
        </div>
      </div>
    `).join('');
  },

  renderFeatures() {
    const features = [
      { 
        icon: '⚡', 
        title: 'Lightning Fast Execution', 
        desc: 'Sub-millisecond order matching with our custom engine handling 1M+ orders/second',
        highlight: '0.4ms avg'
      },
      { 
        icon: '🔒', 
        title: 'Bank-Grade Security', 
        desc: '95% cold storage, multi-sig wallets, 2FA, withdrawal whitelists, regular pen tests',
        highlight: 'SOC 2 Type II'
      },
      { 
        icon: '📊', 
        title: 'Advanced Charts', 
        desc: 'TradingView-powered with 100+ indicators, drawing tools, multiple layouts & timeframes',
        highlight: '100+ indicators'
      },
      { 
        icon: '💧', 
        title: 'Deep Liquidity', 
        desc: 'Aggregated order books from 20+ liquidity providers for tight spreads & minimal slippage',
        highlight: '$50B+ daily vol'
      },
      { 
        icon: '🤖', 
        title: 'API & Trading Bots', 
        desc: 'REST & WebSocket APIs with comprehensive docs, SDKs in 6 languages, webhook support',
        highlight: '120 req/min'
      },
      { 
        icon: '🎁', 
        title: 'Rewards & VIP', 
        desc: 'Earn up to 40% fee rebates, referral bonuses, exclusive VIP perks & priority support',
        highlight: '40% max rebate'
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

  renderStats() {
    const stats = [
      { value: '$50B+', label: '24h Trading Volume', sub: 'Across all markets' },
      { value: '500K+', label: 'Active Traders', sub: 'Worldwide' },
      { value: '200+', label: 'Trading Pairs', sub: 'Spot & perpetual' },
      { value: '99.99%', label: 'Uptime SLA', sub: 'Enterprise grade' }
    ];

    const grid = document.getElementById('stats-grid');
    grid.innerHTML = stats.map((s, i) => `
      <div style="position:relative;">
        ${i < 3 ? '<div style="position:absolute;top:50%;right:-16px;width:1px;height:60px;background:linear-gradient(180deg,transparent,var(--border-muted),transparent);transform:translateY(-50%);"></div>' : ''}
        <div style="font-size:clamp(2.5rem,5vw,4.5rem);font-weight:800;font-family:var(--font-mono);background:linear-gradient(135deg,#00d4ff 0%,#ffd700 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;">${s.value}</div>
        <div style="color:var(--text-primary);margin-top:12px;font-size:1.125rem;font-weight:600;">${s.label}</div>
        <div style="color:var(--text-muted);margin-top:4px;font-size:0.875rem;">${s.sub}</div>
      </div>
    `).join('');
  },

  renderSecurity() {
    const security = [
      { icon: '🛡️', title: 'Cold Storage', desc: '95% of assets offline in multi-sig vaults' },
      { icon: '🔐', title: 'Two-Factor Auth', desc: 'TOTP, hardware keys, biometric support' },
      { icon: '📋', title: 'Withdrawal Whitelist', desc: 'Pre-approved addresses only' },
      { icon: '🔍', title: 'Real-time Monitoring', desc: '24/7 threat detection & auto-freeze' }
    ];

    const grid = document.getElementById('security-grid');
    grid.innerHTML = security.map(s => `
      <div style="text-align:center;padding:32px 24px;background:var(--bg-card);border:1px solid var(--border-muted);border-radius:var(--radius-xl);transition:all var(--transition-normal);">
        <div style="font-size:2.5rem;margin-bottom:20px;">${s.icon}</div>
        <h3 style="font-size:1.125rem;font-weight:700;margin-bottom:8px;">${s.title}</h3>
        <p style="color:var(--text-secondary);font-size:0.875rem;line-height:1.6;">${s.desc}</p>
      </div>
    `).join('');
  },

  async renderMarketsTable() {
    try {
      const response = await fetch('/api/market/tickers');
      const data = await response.json();
      
      if (!data.success) throw new Error('Failed to load markets');
      
      const tickers = data.tickers.slice(0, 8);
      
      const table = document.getElementById('markets-table');
      table.innerHTML = `
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:separate;border-spacing:0 8px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:16px 20px;font-weight:600;color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;">Pair</th>
                <th style="text-align:right;padding:16px 20px;font-weight:600;color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
                <th style="text-align:right;padding:16px 20px;font-weight:600;color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;">24h Change</th>
                <th style="text-align:right;padding:16px 20px;font-weight:600;color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;">24h Volume</th>
                <th style="text-align:center;padding:16px 20px;font-weight:600;color:var(--text-muted);font-size:0.7rem;text-transform:uppercase;letter-spacing:0.5px;"></th>
              </tr>
            </thead>
            <tbody>
              ${tickers.map(t => `
                <tr style="background:var(--bg-card);border:1px solid var(--border-muted);transition:all var(--transition-fast);">
                  <td style="padding:16px 20px;">
                    <div class="flex-center gap-3">
                      <span class="asset-badge">${t.baseCurrency === 'BTC' ? '₿' : t.baseCurrency === 'ETH' ? 'Ξ' : t.baseCurrency[0]}</span>
                      <div>
                        <p style="font-weight:600;">${t.symbol}</p>
                        <p style="font-size:0.75rem;color:var(--text-muted);">${t.baseCurrency}</p>
                      </div>
                    </div>
                  </td>
                  <td style="padding:16px 20px;font-family:var(--font-mono);font-weight:600;font-size:1.0625rem;text-align:right;">$${t.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: t.price < 1 ? 6 : 2})}</td>
                  <td style="padding:16px 20px;text-align:right;">
                    <span class="badge ${t.change24h >= 0 ? 'badge-success' : 'badge-danger'}" style="font-size:0.8125rem;padding:6px 14px;">${t.change24h >= 0 ? '+' : ''}${t.change24h.toFixed(2)}%</span>
                  </td>
                  <td style="padding:16px 20px;text-align:right;font-family:var(--font-mono);color:var(--text-secondary);">$${this.formatVolume(t.volume24h)}</td>
                  <td style="padding:16px 20px;text-align:center;"><a href="/trade?pair=${t.symbol}" data-link class="btn btn-primary btn-sm">Trade</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('Markets table error:', error);
    }
  },

  formatVolume(vol) {
    if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B';
    if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M';
    if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
    return vol.toFixed(0);
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

  initPlatformChart() {
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    document.getElementById('platform-chart').appendChild(canvas);
    this.platformCanvas = canvas;
    this.drawPlatformChart();
  },

  drawPlatformChart() {
    const ctx = this.platformCanvas.getContext('2d');
    const rect = this.platformCanvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.platformCanvas.width = rect.width * dpr;
    this.platformCanvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;
    const padding = { top: 16, right: 60, bottom: 24, left: 50 };
    const cw = w - padding.left - padding.right;
    const ch = h - padding.top - padding.bottom;
    
    const points = 150;
    const data = [];
    let basePrice = 67000;
    for (let i = 0; i < points; i++) {
      basePrice += (Math.random() - 0.48) * 120;
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
    
    // Candlesticks
    const candleWidth = Math.max(1, cw / points * 0.7);
    
    data.forEach((price, i) => {
      const x = padding.left + (i / (points - 1)) * cw;
      const open = price + (Math.random() - 0.5) * 30;
      const close = price + (Math.random() - 0.5) * 30;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;
      
      const color = close >= open ? '#22c55e' : '#ef4444';
      
      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const yHigh = padding.top + (1 - (high - minPrice) / priceRange) * ch;
      const yLow = padding.top + (1 - (low - minPrice) / priceRange) * ch;
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();
      
      // Body
      ctx.fillStyle = color;
      const yOpen = padding.top + (1 - (open - minPrice) / priceRange) * ch;
      const yClose = padding.top + (1 - (close - minPrice) / priceRange) * ch;
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });
    
    // Price scale
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono"';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const price = maxPrice - (i / 4) * priceRange;
      const y = padding.top + (i / 4) * ch;
      ctx.fillText(price.toLocaleString(undefined, {maximumFractionDigits: 0}), padding.left - 10, y + 3);
    }
    
    // Last price
    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 12px "JetBrains Mono"';
    ctx.textAlign = 'left';
    const lastPrice = data[data.length - 1];
    const lastY = padding.top + (1 - (lastPrice - minPrice) / priceRange) * ch;
    ctx.fillText('$' + lastPrice.toLocaleString(undefined, {minimumFractionDigits: 2}), w - padding.right + 10, lastY + 4);
  },

  startPriceUpdates() {
    this.priceInterval = setInterval(() => {
      this.renderLivePriceStrip();
      this.renderTrendingCards(document.querySelector('[data-trending].btn-primary')?.dataset.trending || 'gainers');
      this.renderMarketsTable();
    }, 15000);
  },

  destroy() {
    if (this.priceInterval) clearInterval(this.priceInterval);
  }
};