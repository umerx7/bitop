export default {
  template: `
    <div class="page-container" style="padding:24px 0;">
      <div class="container">
        <div style="margin-bottom:32px;">
          <h1 style="font-size:1.75rem;font-weight:700;margin-bottom:8px;">Identity Verification</h1>
          <p style="color:var(--text-secondary);">Complete KYC to unlock higher limits and features</p>
        </div>

        <div class="card" style="margin-bottom:24px;">
          <div style="padding:24px;">
            <div class="flex-between" style="align-items:flex-start;margin-bottom:24px;">
              <div>
                <h3 style="font-size:1.125rem;font-weight:600;margin-bottom:4px;">Verification Status</h3>
                <p style="color:var(--text-secondary);">Your current KYC level</p>
              </div>
              <div style="text-align:right;">
                <div class="badge badge-${this.getStatusClass()}" style="font-size:1rem;padding:8px 16px;" id="kyc-status-badge">${this.getStatusLabel()}</div>
                <p style="color:var(--text-muted);font-size:0.75rem;margin-top:4px;">${this.getStatusDesc()}</p>
              </div>
            </div>
            <div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
              <div style="height:100%;width:${this.getProgress()}%;background:linear-gradient(135deg,var(--accent-primary),var(--gold-primary));border-radius:4px;transition:width 0.3s;"></div>
            </div>
            <p style="color:var(--text-muted);font-size:0.75rem;margin-top:8px;text-align:right;">${this.getProgress()}% Complete</p>
          </div>
        </div>

        <div class="grid grid-3" style="gap:20px;margin-bottom:24px;" id="kyc-levels"></div>

        <div class="card" id="kyc-form-container" style="display:none;">
          <div class="card-header flex-between">
            <h3 class="card-title" id="kyc-form-title"></h3>
            <button class="btn btn-ghost btn-icon" id="close-kyc-form"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <form id="kyc-form" style="padding:24px;"></form>
        </div>

        <div class="card" style="margin-top:24px;">
          <div class="card-header"><h3 class="card-title">Verification History</h3></div>
          <div class="table-wrapper" id="kyc-history"></div>
        </div>

        <div class="card" style="margin-top:24px;background:var(--bg-secondary);border-color:var(--border-gold);">
          <div style="padding:24px;">
            <h3 style="font-weight:600;margin-bottom:12px;">Why Verify?</h3>
            <div class="grid grid-3" style="gap:16px;color:var(--text-secondary);font-size:0.875rem;">
              <div class="flex-center gap-2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><span>Higher withdrawal limits</span></div>
              <div class="flex-center gap-2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><span>Fiat on/off ramp access</span></div>
              <div class="flex-center gap-2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><span>Priority support</span></div>
              <div class="flex-center gap-2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><span>Increased trading limits</span></div>
              <div class="flex-center gap-2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><span>API rate limit increases</span></div>
              <div class="flex-center gap-2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg><span>Exclusive promotions</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  async init() {
    this.kycData = null;
    await this.loadKYCData();
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('close-kyc-form').addEventListener('click', () => this.closeForm());
  },

  async loadKYCData() {
    try {
      const response = await fetch('/api/kyc/status', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        this.kycData = data.kyc;
        this.renderLevels();
        this.renderHistory();
      }
    } catch (error) {
      console.error('KYC load error:', error);
    }
  },

  getStatusClass() {
    if (!this.kycData) return 'info';
    const status = this.kycData.status;
    if (status === 'verified') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'rejected') return 'danger';
    return 'info';
  },

  getStatusLabel() {
    if (!this.kycData) return 'Not Started';
    const labels = { none: 'Not Started', basic: 'Basic', verified: 'Verified', pending: 'Under Review', rejected: 'Rejected' };
    return labels[this.kycData.status] || 'Unknown';
  },

  getStatusDesc() {
    if (!this.kycData) return 'Complete verification to unlock features';
    const descs = { 
      none: 'Start verification to unlock features',
      basic: 'Basic info verified. Complete full KYC for higher limits.',
      verified: 'Fully verified. All features unlocked.',
      pending: 'Your documents are being reviewed.',
      rejected: 'Verification failed. Please try again.'
    };
    return descs[this.kycData.status] || '';
  },

  getProgress() {
    if (!this.kycData) return 0;
    const progress = { none: 0, basic: 33, verified: 100, pending: 66, rejected: 0 };
    return progress[this.kycData.status] || 0;
  },

  renderLevels() {
    const container = document.getElementById('kyc-levels');
    const levels = [
      { id: 'basic', title: 'Level 1: Basic', desc: 'Email & phone verification', limit: '$10K/day', icon: '📧', required: true, status: this.kycData?.levels?.basic || 'none' },
      { id: 'identity', title: 'Level 2: Identity', desc: 'Government ID + selfie', limit: '$100K/day', icon: '🆔', required: true, status: this.kycData?.levels?.identity || 'none' },
      { id: 'address', title: 'Level 3: Address', desc: 'Proof of address document', limit: 'Unlimited', icon: '🏠', required: false, status: this.kycData?.levels?.address || 'none' }
    ];

    container.innerHTML = levels.map(l => `
      <div class="card kyc-level-card" style="position:relative;cursor:pointer;" data-level="${l.id}">
        <div style="position:absolute;top:16px;right:16px;">
          <span class="badge badge-${this.getLevelStatusClass(l.status)}">${this.getLevelStatusLabel(l.status)}</span>
        </div>
        <div style="font-size:2rem;margin-bottom:12px;">${l.icon}</div>
        <h4 style="font-weight:600;margin-bottom:4px;">${l.title}</h4>
        <p style="color:var(--text-secondary);font-size:0.875rem;margin-bottom:12px;">${l.desc}</p>
        <div style="font-family:var(--font-mono);font-weight:600;color:var(--gold-primary);margin-bottom:16px;">${l.limit}</div>
        <button class="btn ${l.status === 'verified' ? 'btn-secondary' : 'btn-primary'} btn-sm btn-full" data-action="${l.status === 'verified' ? 'view' : 'start'}" ${l.status === 'pending' ? 'disabled' : ''}>
          ${l.status === 'verified' ? 'Verified' : l.status === 'pending' ? 'Under Review' : 'Start Verification'}
        </button>
      </div>
    `).join('');

    container.querySelectorAll('[data-action="start"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.kyc-level-card');
        this.openForm(card.dataset.level);
      });
    });
  },

  getLevelStatusClass(status) {
    if (status === 'verified') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'rejected') return 'danger';
    return 'info';
  },

  getLevelStatusLabel(status) {
    const labels = { verified: 'Verified', pending: 'Pending', rejected: 'Rejected', none: 'Not Started' };
    return labels[status] || 'Unknown';
  },

  openForm(level) {
    const container = document.getElementById('kyc-form-container');
    const title = document.getElementById('kyc-form-title');
    const form = document.getElementById('kyc-form');

    const forms = {
      basic: { title: 'Basic Verification', fields: `
        <div class="grid grid-2" style="gap:16px;margin-bottom:16px;">
          <div class="input-group"><input type="text" name="firstName" required style="width:100%;"><label for="firstName">First Name</label></div>
          <div class="input-group"><input type="text" name="lastName" required style="width:100%;"><label for="lastName">Last Name</label></div>
        </div>
        <div class="grid grid-2" style="gap:16px;margin-bottom:16px;">
          <div class="input-group"><input type="email" name="email" required style="width:100%;"><label for="email">Email</label></div>
          <div class="input-group"><input type="tel" name="phone" required style="width:100%;"><label for="phone">Phone Number</label></div>
        </div>
        <div class="input-group" style="margin-bottom:16px;"><input type="date" name="dob" required style="width:100%;"><label for="dob">Date of Birth</label></div>
        <div class="grid grid-2" style="gap:16px;margin-bottom:16px;">
          <div class="input-group"><input type="text" name="country" required style="width:100%;"><label for="country">Country</label></div>
          <div class="input-group"><input type="text" name="city" required style="width:100%;"><label for="city">City</label></div>
        </div>
        <div class="input-group" style="margin-bottom:16px;"><input type="text" name="address" required style="width:100%;"><label for="address">Address</label></div>
        <div class="grid grid-2" style="gap:16px;margin-bottom:24px;">
          <div class="input-group"><input type="text" name="postalCode" required style="width:100%;"><label for="postalCode">Postal Code</label></div>
          <div class="input-group"><input type="text" name="state" style="width:100%;"><label for="state">State/Province</label></div>
        </div>
      `},
      identity: { title: 'Identity Verification', fields: `
        <div style="margin-bottom:24px;padding:16px;background:var(--bg-secondary);border-radius:var(--radius-md);">
          <p style="color:var(--text-secondary);font-size:0.875rem;">Upload a clear photo of your government-issued ID (passport, driver's license, or national ID)</p>
        </div>
        <div class="input-group" style="margin-bottom:16px;"><label style="display:block;margin-bottom:8px;font-size:0.875rem;">ID Type</label><select name="idType" required style="width:100%;"><option value="passport">Passport</option><option value="drivers_license">Driver's License</option><option value="national_id">National ID</option></select></div>
        <div style="margin-bottom:16px;"><label style="display:block;margin-bottom:8px;font-size:0.875rem;">Front of ID</label><input type="file" name="idFront" accept="image/*" required style="width:100%;"></div>
        <div style="margin-bottom:16px;"><label style="display:block;margin-bottom:8px;font-size:0.875rem;">Back of ID</label><input type="file" name="idBack" accept="image/*" required style="width:100%;"></div>
        <div style="margin-bottom:24px;"><label style="display:block;margin-bottom:8px;font-size:0.875rem;">Selfie with ID</label><input type="file" name="selfie" accept="image/*" required style="width:100%;"></div>
      `},
      address: { title: 'Address Verification', fields: `
        <div style="margin-bottom:24px;padding:16px;background:var(--bg-secondary);border-radius:var(--radius-md);">
          <p style="color:var(--text-secondary);font-size:0.875rem;">Upload a proof of address document (utility bill, bank statement, or government letter) issued within the last 3 months</p>
        </div>
        <div class="input-group" style="margin-bottom:16px;"><label style="display:block;margin-bottom:8px;font-size:0.875rem;">Document Type</label><select name="docType" required style="width:100%;"><option value="utility_bill">Utility Bill</option><option value="bank_statement">Bank Statement</option><option value="government_letter">Government Letter</option></select></div>
        <div style="margin-bottom:24px;"><label style="display:block;margin-bottom:8px;font-size:0.875rem;">Document</label><input type="file" name="addressDoc" accept="image/*,.pdf" required style="width:100%;"></div>
      `}
    };

    const config = forms[level];
    title.textContent = config.title;
    form.innerHTML = config.fields + '<button type="submit" class="btn btn-primary btn-full btn-lg">Submit for Review</button>';
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });

    form.addEventListener('submit', (e) => this.submitKYC(e, level));
  },

  closeForm() {
    document.getElementById('kyc-form-container').style.display = 'none';
  },

  async submitKYC(e, level) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    formData.append('level', level);

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span>Submitting...';

    try {
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        this.showToast('Verification submitted for review', 'success');
        this.closeForm();
        this.loadKYCData();
      } else {
        this.showToast(data.message || 'Submission failed', 'error');
      }
    } catch (error) {
      this.showToast('Network error', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Submit for Review';
    }
  },

  renderHistory() {
    const table = document.getElementById('kyc-history');
    // Mock history
    table.innerHTML = `
      <table>
        <thead><tr><th>Level</th><th>Status</th><th>Submitted</th><th>Reviewed</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>Basic</td><td><span class="badge badge-success">Verified</span></td><td>2024-01-15</td><td>2024-01-15</td><td>Auto-approved</td></tr>
          <tr><td>Identity</td><td><span class="badge badge-warning">Pending</span></td><td>2024-01-20</td><td>-</td><td>Under review</td></tr>
          <tr><td>Address</td><td><span class="badge badge-info">Not Started</span></td><td>-</td><td>-</td><td>-</td></tr>
        </tbody>
      </table>
    `;
  },

  showToast(message, type) {
    import('./components/toast.js').then(module => {
      module.showToast(message, type);
    });
  }
};