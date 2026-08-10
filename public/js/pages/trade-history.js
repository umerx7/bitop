export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div class="flex-between flex-wrap gap-4" style="margin-bottom:24px;align-items:center;">
          <div>
            <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Trade History</h1>
            <p style="color:var(--text-secondary);">View your complete trading history</p>
          </div>
          <div class="flex-center gap-2">
            <button class="btn btn-secondary" id="export-trades"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span>Export CSV</span></button>
          </div>
        </div>

        <div class="card" style="margin-bottom:24px;">
          <div style="padding:16px 24px;border-bottom:1px solid var(--border-muted);">
            <div class="flex-between flex-wrap gap-4">
              <div class="flex-center gap-3 flex-wrap">
                <div class="input-group" style="width:250px;"><svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><input type="text" id="trade-search" placeholder="Search trades..." style="width:100%;padding-left:40px;"></div>
                <select id="trade-pair-filter" class="select" style="min-width:140px;"><option value="all">All Pairs</option></select>
                <select id="trade-type-filter" class="select" style="min-width:120px;"><option value="all">All Types</option><option value="buy">Buy</option><option value="sell">Sell</option></select>
                <select id="trade-status-filter" class="select" style="min-width:120px;"><option value="all">All Status</option><option value="filled">Filled</option><option value="partial">Partially Filled</option><option value="cancelled">Cancelled</option><option value="pending">Pending</option></select>
              </div>
              <div class="flex-center gap-2">
                <input type="date" id="trade-date-from" class="input" style="width:auto;">
                <span style="color:var(--text-muted);">to</span>
                <input type="date" id="trade-date-to" class="input" style="width:auto;">
              </div>
            </div>
          </div>

          <div class="table-wrapper" id="trades-table"></div>

          <div style="padding:16px 24px;border-top:1px solid var(--border-muted);display:flex;justify-content:center;align-items:center;gap:12px;" id="trades-pagination"></div>
        </div>

        <div class="grid grid-4" style="gap:20px;" id="trade-stats"></div>
      </div>
    </div>
  `,

  async init() {
    this.currentPage = 1;
    this.pageSize = 50;
    this.allTrades = [];
    this.filteredTrades = [];
    
    this.bindEvents();
    await this.loadTrades();
  },

  bindEvents() {
    document.getElementById('trade-search').addEventListener('input', () => { this.currentPage = 1; this.applyFilters(); });
    document.getElementById('trade-pair-filter').addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
    document.getElementById('trade-type-filter').addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
    document.getElementById('trade-status-filter').addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
    document.getElementById('trade-date-from').addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
    document.getElementById('trade-date-to').addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
    document.getElementById('export-trades').addEventListener('click', () => this.exportCSV());
  },

  async loadTrades() {
    const table = document.getElementById('trades-table');
    table.innerHTML = '<div style="padding:60px;text-align:center;color:var(--text-muted);">Loading trades...</div>';

    try {
      const response = await fetch('/api/trades/history?limit=1000', { credentials: 'include' });
      const data = await response.json();

      if (data.success) {
        this.allTrades = data.trades;
        this.populatePairFilter();
        this.applyFilters();
        this.renderStats();
      } else {
        throw new Error(data.message || 'Failed to load trades');
      }
    } catch (error) {
      console.error('Trades load error:', error);
      table.innerHTML = '<div style="padding:60px;text-align:center;color:var(--danger);">Failed to load trades</div>';
    }
  },

  populatePairFilter() {
    const pairs = [...new Set(this.allTrades.map(t => t.pair))].sort();
    const select = document.getElementById('trade-pair-filter');
    select.innerHTML = '<option value="all">All Pairs</option>' + pairs.map(p => `<option value="${p}">${p}</option>`).join('');
  },

  applyFilters() {
    const search = document.getElementById('trade-search').value.toLowerCase();
    const pairFilter = document.getElementById('trade-pair-filter').value;
    const typeFilter = document.getElementById('trade-type-filter').value;
    const statusFilter = document.getElementById('trade-status-filter').value;
    const dateFrom = document.getElementById('trade-date-from').value;
    const dateTo = document.getElementById('trade-date-to').value;

    this.filteredTrades = this.allTrades.filter(t => {
      if (search && !t.pair.toLowerCase().includes(search) && !t._id.toLowerCase().includes(search)) return false;
      if (pairFilter !== 'all' && t.pair !== pairFilter) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (dateFrom && new Date(t.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });

    this.filteredTrades.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    this.renderTable();
    this.renderPagination();
  },

  renderTable() {
    const table = document.getElementById('trades-table');
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const trades = this.filteredTrades.slice(start, end);

    if (trades.length === 0) {
      table.innerHTML = '<div style="padding:60px;text-align:center;color:var(--text-muted);">No trades found</div>';
      return;
    }

    table.innerHTML = `
      <table>
        <thead>
          <tr><th>Date</th><th>Pair</th><th>Type</th><th>Price</th><th>Amount</th><th>Filled</th><th>Total</th><th>Fee</th><th>Status</th><th>Order ID</th></tr>
        </thead>
        <tbody>
          ${trades.map(t => `
            <tr>
              <td style="color:var(--text-secondary);font-size:0.8125rem;white-space:nowrap;">${new Date(t.createdAt).toLocaleString()}</td>
              <td style="font-weight:600;">${t.pair}</td>
              <td><span class="badge ${t.type === 'buy' ? 'badge-success' : 'badge-danger'}">${t.type.toUpperCase()}</span></td>
              <td style="font-family:var(--font-mono);">$${t.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              <td style="font-family:var(--font-mono);">${t.amount.toLocaleString(undefined, {maximumFractionDigits: 8})}</td>
              <td style="font-family:var(--font-mono);color:${t.filled === t.amount ? 'var(--success)' : 'var(--warning)'};">${t.filled.toLocaleString(undefined, {maximumFractionDigits: 8})}</td>
              <td style="font-family:var(--font-mono);font-weight:500;">$${(t.filled * t.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              <td style="font-family:var(--font-mono);color:var(--text-secondary);">$${t.fee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}</td>
              <td><span class="badge ${this.getStatusBadgeClass(t.status)}">${t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span></td>
              <td style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);">${t._id.toString().slice(-8)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  getStatusBadgeClass(status) {
    switch (status) {
      case 'filled': return 'badge-success';
      case 'partial': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      case 'pending': return 'badge-info';
      default: return 'badge-info';
    }
  },

  renderPagination() {
    const pagination = document.getElementById('trades-pagination');
    const totalPages = Math.ceil(this.filteredTrades.length / this.pageSize);

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = '';
    if (this.currentPage > 1) html += `<button class="btn btn-ghost btn-sm" data-page="${this.currentPage - 1}">Previous</button>`;
    
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="btn btn-${i === this.currentPage ? 'primary' : 'ghost'} btn-sm" data-page="${i}" style="min-width:40px;">${i}</button>`;
    }

    if (this.currentPage < totalPages) html += `<button class="btn btn-ghost btn-sm" data-page="${this.currentPage + 1}">Next</button>`;

    pagination.innerHTML = html;

    pagination.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentPage = parseInt(btn.dataset.page);
        this.renderTable();
        this.renderPagination();
      });
    });
  },

  renderStats() {
    const container = document.getElementById('trade-stats');
    const filled = this.allTrades.filter(t => t.status === 'filled');
    const totalVolume = filled.reduce((sum, t) => sum + t.filled * t.price, 0);
    const totalFees = filled.reduce((sum, t) => sum + t.fee, 0);
    const buyCount = filled.filter(t => t.type === 'buy').length;
    const sellCount = filled.filter(t => t.type === 'sell').length;

    container.innerHTML = `
      <div class="card"><div class="flex-between"><span style="color:var(--text-secondary);font-size:0.875rem;">Total Volume</span><span style="font-size:1.5rem;">📊</span></div><div style="margin-top:12px;"><div style="font-size:1.5rem;font-weight:700;font-family:var(--font-mono);">$${totalVolume.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div></div>
      <div class="card"><div class="flex-between"><span style="color:var(--text-secondary);font-size:0.875rem;">Total Fees Paid</span><span style="font-size:1.5rem;">💸</span></div><div style="margin-top:12px;"><div style="font-size:1.5rem;font-weight:700;font-family:var(--font-mono);">$${totalFees.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div></div>
      <div class="card"><div class="flex-between"><span style="color:var(--text-secondary);font-size:0.875rem;">Buy Orders</span><span style="font-size:1.5rem;">📈</span></div><div style="margin-top:12px;"><div style="font-size:1.5rem;font-weight:700;font-family:var(--font-mono);">${buyCount}</div></div></div>
      <div class="card"><div class="flex-between"><span style="color:var(--text-secondary);font-size:0.875rem;">Sell Orders</span><span style="font-size:1.5rem;">📉</span></div><div style="margin-top:12px;"><div style="font-size:1.5rem;font-weight:700;font-family:var(--font-mono);">${sellCount}</div></div></div>
    `;
  },

  exportCSV() {
    const headers = ['Date', 'Pair', 'Type', 'Price', 'Amount', 'Filled', 'Total', 'Fee', 'Status', 'Order ID'];
    const rows = this.filteredTrades.map(t => [
      new Date(t.createdAt).toISOString(),
      t.pair,
      t.type,
      t.price,
      t.amount,
      t.filled,
      t.filled * t.price,
      t.fee,
      t.status,
      t._id
    ]);
    
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitop-trades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};