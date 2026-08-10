export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div style="margin-bottom:24px;">
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Markets</h1>
          <p style="color:var(--text-secondary);">Real-time prices for 200+ trading pairs</p>
        </div>

        <div class="card" style="margin-bottom:24px;">
          <div style="padding:20px;border-bottom:1px solid var(--border-muted);">
            <div class="flex-between flex-wrap gap-4" style="align-items:center;">
              <div class="flex-center gap-3 flex-wrap">
                <div class="input-group" style="width:280px;max-width:100%;">
                  <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" id="market-search" placeholder="Search markets..." style="width:100%;padding-left:40px;">
                </div>
                <select id="market-filter" class="select" style="min-width:160px;">
                  <option value="all">All Markets</option>
                  <option value="usdt">USDT Pairs</option>
                  <option value="btc">BTC Pairs</option>
                  <option value="eth">ETH Pairs</option>
                  <option value="gainers">Top Gainers</option>
                  <option value="losers">Top Losers</option>
                  <option value="volume">Highest Volume</option>
                </select>
                <select id="market-sort" class="select" style="min-width:160px;">
                  <option value="volume">Sort by Volume</option>
                  <option value="change">Sort by 24h Change</option>
                  <option value="price">Sort by Price</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
              <div class="flex-center gap-2">
                <button class="btn btn-ghost btn-sm" id="refresh-markets"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg><span>Refresh</span></button>
                <button class="btn btn-primary btn-sm" data-link href="/trade"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span>Trade</span></button>
              </div>
            </div>
          </div>

          <div class="table-wrapper" id="markets-table">
            <div style="padding:60px;text-align:center;color:var(--text-muted);">Loading markets...</div>
          </div>
        </div>

        <div style="display:flex;justify-content:center;align-items:center;gap:12px;margin-top:24px;" id="pagination"></div>
      </div>
    </div>
  `,

  async init() {
    this.currentPage = 1;
    this.pageSize = 50;
    this.allTickers = [];
    this.filteredTickers = [];
    this.sortConfig = { key: 'volume24h', direction: 'desc' };
    
    this.bindEvents();
    await this.loadMarkets();
    this.startAutoRefresh();
  },

  bindEvents() {
    const searchInput = document.getElementById('market-search');
    const filterSelect = document.getElementById('market-filter');
    const sortSelect = document.getElementById('market-sort');
    const refreshBtn = document.getElementById('refresh-markets');

    searchInput.addEventListener('input', () => this.applyFilters());
    filterSelect.addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
    sortSelect.addEventListener('change', () => { this.sortConfig.key = sortSelect.value; this.applyFilters(); });
    refreshBtn.addEventListener('click', () => this.loadMarkets());
  },

  async loadMarkets() {
    const table = document.getElementById('markets-table');
    table.innerHTML = '<div style="padding:60px;text-align:center;color:var(--text-muted);">Loading markets...</div>';

    try {
      const response = await fetch('/api/market/tickers');
      const data = await response.json();

      if (data.success) {
        this.allTickers = data.tickers;
        this.applyFilters();
      } else {
        throw new Error(data.message || 'Failed to load markets');
      }
    } catch (error) {
      console.error('Markets load error:', error);
      table.innerHTML = '<div style="padding:60px;text-align:center;color:var(--danger);">Failed to load markets. <button class="btn btn-primary btn-sm" onclick="location.reload()">Retry</button></div>';
    }
  },

  applyFilters() {
    const search = document.getElementById('market-search').value.toLowerCase();
    const filter = document.getElementById('market-filter').value;

    this.filteredTickers = this.allTickers.filter(t => {
      const matchesSearch = t.symbol.toLowerCase().includes(search) || t.baseCurrency.toLowerCase().includes(search);
      if (!matchesSearch) return false;

      switch (filter) {
        case 'usdt': return t.quoteCurrency === 'USDT';
        case 'btc': return t.quoteCurrency === 'BTC';
        case 'eth': return t.quoteCurrency === 'ETH';
        case 'gainers': return t.change24h > 0;
        case 'losers': return t.change24h < 0;
        case 'volume': return true;
        default: return true;
      }
    });

    this.sortTickers();
    this.renderTable();
    this.renderPagination();
  },

  sortTickers() {
    const { key, direction } = this.sortConfig;
    this.filteredTickers.sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];
      
      if (key === 'symbol' || key === 'baseCurrency') {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }

      if (direction === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  },

  renderTable() {
    const table = document.getElementById('markets-table');
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const tickers = this.filteredTickers.slice(start, end);

    if (tickers.length === 0) {
      table.innerHTML = '<div style="padding:60px;text-align:center;color:var(--text-muted);">No markets found</div>';
      return;
    }

    table.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Pair</th>
            <th>Price</th>
            <th>24h Change</th>
            <th>24h High / Low</th>
            <th>24h Volume</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${tickers.map(t => `
            <tr style="cursor:pointer;" data-pair="${t.symbol}" onclick="window.location.href='/trade?pair=${t.symbol}'">
              <td>
                <div class="flex-center gap-2">
                  <span class="badge badge-info" style="font-size:0.625rem;padding:2px 6px;">${t.baseCurrency}</span>
                  <span style="font-weight:600;">${t.symbol}</span>
                </div>
              </td>
              <td style="font-family:var(--font-mono);font-weight:500;">$${t.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: t.price < 1 ? 6 : 2})}</td>
              <td>
                <span class="badge ${t.change24h >= 0 ? 'badge-success' : 'badge-danger'}">${t.change24h >= 0 ? '+' : ''}${t.change24h.toFixed(2)}%</span>
              </td>
              <td style="font-family:var(--font-mono);color:var(--text-secondary);font-size:0.8125rem;">$${t.high24h?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} / $${t.low24h?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              <td style="font-family:var(--font-mono);color:var(--text-secondary);">$${this.formatVolume(t.volume24h)}</td>
              <td><a href="/trade?pair=${t.symbol}" data-link class="btn btn-ghost btn-sm btn-primary">Trade</a></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(this.filteredTickers.length / this.pageSize);

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = '';
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (this.currentPage > 1) {
      html += `<button class="btn btn-ghost btn-sm" data-page="${this.currentPage - 1}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="btn btn-${i === this.currentPage ? 'primary' : 'ghost'} btn-sm" data-page="${i}" style="min-width:40px;">${i}</button>`;
    }

    if (this.currentPage < totalPages) {
      html += `<button class="btn btn-ghost btn-sm" data-page="${this.currentPage + 1}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>`;
    }

    pagination.innerHTML = html;

    pagination.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentPage = parseInt(btn.dataset.page);
        this.renderTable();
        this.renderPagination();
      });
    });
  },

  formatVolume(vol) {
    if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B';
    if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M';
    if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
    return vol.toFixed(0);
  },

  startAutoRefresh() {
    this.refreshInterval = setInterval(() => this.loadMarkets(), 30000);
  },

  destroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }
};