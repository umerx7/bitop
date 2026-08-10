export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div class="flex-between flex-wrap gap-4" style="margin-bottom:24px;align-items:center;">
          <div>
            <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Transaction History</h1>
            <p style="color:var(--text-secondary);">View all your deposits, withdrawals, and transfers</p>
          </div>
          <button class="btn btn-secondary" id="export-history"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg><span>Export CSV</span></button>
        </div>

        <div class="card" style="margin-bottom:24px;">
          <div style="padding:16px 24px;border-bottom:1px solid var(--border-muted);">
            <div class="flex-between flex-wrap gap-4">
              <div class="flex-center gap-3 flex-wrap">
                <div class="input-group" style="width:250px;"><svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><input type="text" id="history-search" placeholder="Search transactions..." style="width:100%;padding-left:40px;"></div>
                <select id="history-type-filter" class="select" style="min-width:140px;"><option value="all">All Types</option><option value="deposit">Deposits</option><option value="withdrawal">Withdrawals</option><option value="transfer">Transfers</option><option value="convert">Conversions</option><option value="trade">Trading Fees</option><option value="referral">Referral Earnings</option></select>
                <select id="history-currency-filter" class="select" style="min-width:120px;"><option value="all">All Assets</option></select>
                <select id="history-status-filter" class="select" style="min-width:120px;"><option value="all">All Status</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option></select>
              </div>
              <div class="flex-center gap-2">
                <input type="date" id="history-date-from" class="input" style="width:auto;">
                <span style="color:var(--text-muted);">to</span>
                <input type="date" id="history-date-to" class="input" style="width:auto;">
              </div>
            </div>
          </div>

          <div class="table-wrapper" id="history-table"></div>

          <div style="padding:16px 24px;border-top:1px solid var(--border-muted);display:flex;justify-content:center;align-items:center;gap:12px;" id="history-pagination"></div>
        </div>

        <div class="grid grid-4" style="gap:20px;" id="history-stats"></div>
      </div>
    </div>
  `,

  async init() {
    this.currentPage = 1;
    this.pageSize = 50;
    this.allTransactions = [];
    this.filteredTransactions = [];
    
    this.bindEvents();
    await this.loadHistory();
  },

  bindEvents() {
    document.getElementById('history-search').addEventListener('input', () => { this.currentPage = 1; this.applyFilters(); });
    document.getElementById('history-type-filter').addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
    document.getElementById('history-currency-filter').addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
    document.getElementById('history-status-filter').addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
    document.getElementById('history-date-from').addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
    document.getElementById('history-date-to').addEventListener('change', () => { this.currentPage = 1; this.applyFilters(); });
    document.getElementById('export-history').addEventListener('click', () => this.exportCSV());
  },

  async loadHistory() {
    const table = document.getElementById('history-table');
    table.innerHTML = '<div style="padding:60px;text-align:center;color:var(--text-muted);">Loading transactions...</div>';

    try {
      const response = await fetch('/api/wallet/transactions?limit=1000', { credentials: 'include' });
      const data = await response.json();

      if (data.success) {
        this.allTransactions = data.transactions;
        this.populateFilters();
        this.applyFilters();
        this.renderStats();
      } else {
        throw new Error(data.message || 'Failed to load history');
      }
    } catch (error) {
      console.error('History load error:', error);
      table.innerHTML = '<div style="padding:60px;text-align:center;color:var(--danger);">Failed to load transactions</div>';
    }
  },

  populateFilters() {
    const currencies = [...new Set(this.allTransactions.map(t => t.currency))].sort();
    const currencySelect = document.getElementById('history-currency-filter');
    currencySelect.innerHTML = '<option value="all">All Assets</option>' + currencies.map(c => `<option value="${c}">${c}</option>`).join('');
  },

  applyFilters() {
    const search = document.getElementById('history-search').value.toLowerCase();
    const typeFilter = document.getElementById('history-type-filter').value;
    const currencyFilter = document.getElementById('history-currency-filter').value;
    const statusFilter = document.getElementById('history-status-filter').value;
    const dateFrom = document.getElementById('history-date-from').value;
    const dateTo = document.getElementById('history-date-to').value;

    this.filteredTransactions = this.allTransactions.filter(t => {
      const searchText = `${t.type} ${t.currency} ${t.amount} ${t.txHash || ''} ${t.address || ''} ${t.counterpartyName || ''}`.toLowerCase();
      if (search && !searchText.includes(search)) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (currencyFilter !== 'all' && t.currency !== currencyFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (dateFrom && new Date(t.timestamp) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.timestamp) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });

    this.filteredTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    this.renderTable();
    this.renderPagination();
  },

  renderTable() {
    const table = document.getElementById('history-table');
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const transactions = this.filteredTransactions.slice(start, end);

    if (transactions.length === 0) {
      table.innerHTML = '<div style="padding:60px;text-align:center;color:var(--text-muted);">No transactions found</div>';
      return;
    }

    table.innerHTML = `
      <table>
        <thead>
          <tr><th>Date</th><th>Type</th><th>Asset</th><th>Amount</th><th>Counterparty</th><th>Status</th><th>Tx Hash</th><th>Fee</th></tr>
        </thead>
        <tbody>
          ${transactions.map(t => `
            <tr>
              <td style="color:var(--text-secondary);font-size:0.8125rem;white-space:nowrap;">${new Date(t.timestamp).toLocaleString()}</td>
              <td><span class="badge ${this.getTypeBadgeClass(t.type)}">${this.formatType(t.type)}</span></td>
              <td style="font-weight:600;">${t.currency}</td>
              <td style="font-family:var(--font-mono);color:${t.direction === 'in' ? 'var(--success)' : 'var(--danger)'};">${t.direction === 'in' ? '+' : '-'}${t.amount.toLocaleString(undefined, {maximumFractionDigits: 8})}</td>
              <td style="color:var(--text-secondary);font-size:0.8125rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.counterpartyName || t.address?.slice(0, 20) + '...' || '-'}</td>
              <td><span class="badge ${this.getStatusBadgeClass(t.status)}">${t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span></td>
              <td style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);">${t.txHash?.slice(0, 16) + '...' || '-'}</td>
              <td style="font-family:var(--font-mono);color:var(--text-secondary);">${t.fee ? t.fee.toLocaleString(undefined, {maximumFractionDigits: 8}) + ' ' + t.currency : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  getTypeBadgeClass(type) {
    switch (type) {
      case 'deposit': return 'badge-success';
      case 'withdrawal': return 'badge-danger';
      case 'transfer': return 'badge-info';
      case 'convert': return 'badge-gold';
      case 'trade': return 'badge-primary';
      case 'referral': return 'badge-warning';
      default: return 'badge-info';
    }
  },

  formatType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  },

  getStatusBadgeClass(status) {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'processing': return 'badge-info';
      case 'failed': return 'badge-danger';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-info';
    }
  },

  renderPagination() {
    const pagination = document.getElementById('history-pagination');
    const totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);

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
    const container = document.getElementById('history-stats');
    const completed = this.allTransactions.filter(t => t.status === 'completed');
    const deposits = completed.filter(t => t.type === 'deposit' && t.direction === 'in').reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = completed.filter(t => t.type === 'withdrawal' && t.direction === 'out').reduce((sum, t) => sum + t.amount, 0);
    const totalFees = completed.reduce((sum, t) => sum + (t.fee || 0), 0);
    const txCount = completed.length;

    container.innerHTML = `
      <div class="card"><div class="flex-between"><span style="color:var(--text-secondary);font-size:0.875rem;">Total Deposits</span><span style="font-size:1.5rem;">⬇</span></div><div style="margin-top:12px;"><div style="font-size:1.5rem;font-weight:700;font-family:var(--font-mono);color:var(--success);">${deposits.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div></div>
      <div class="card"><div class="flex-between"><span style="color:var(--text-secondary);font-size:0.875rem;">Total Withdrawals</span><span style="font-size:1.5rem;">⬆</span></div><div style="margin-top:12px;"><div style="font-size:1.5rem;font-weight:700;font-family:var(--font-mono);color:var(--danger);">${withdrawals.toLocaleString(undefined, {minimumFractionDigits: 2})}</div></div></div>
      <div class="card"><div class="flex-between"><span style="color:var(--text-secondary);font-size:0.875rem;">Total Fees</span><span style="font-size:1.5rem;">💸</span></div><div style="margin-top:12px;"><div style="font-size:1.5rem;font-weight:700;font-family:var(--font-mono);color:var(--gold-primary);">${totalFees.toLocaleString(undefined, {minimumFractionDigits: 4})}</div></div></div>
      <div class="card"><div class="flex-between"><span style="color:var(--text-secondary);font-size:0.875rem;">Transactions</span><span style="font-size:1.5rem;">📋</span></div><div style="margin-top:12px;"><div style="font-size:1.5rem;font-weight:700;font-family:var(--font-mono);">${txCount}</div></div></div>
    `;
  },

  exportCSV() {
    const headers = ['Date', 'Type', 'Asset', 'Direction', 'Amount', 'Counterparty', 'Status', 'Tx Hash', 'Fee'];
    const rows = this.filteredTransactions.map(t => [
      new Date(t.timestamp).toISOString(),
      t.type,
      t.currency,
      t.direction,
      t.amount,
      t.counterpartyName || t.address || '',
      t.status,
      t.txHash || '',
      t.fee || 0
    ]);
    
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitop-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};