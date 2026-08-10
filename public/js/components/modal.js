export function createModal({ title, content, size = 'md', onClose, footer }) {
  const sizes = { sm: '400px', md: '500px', lg: '700px', xl: '900px', full: '95vw' };
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width: ${sizes[size]}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <h3 class="modal-title" id="modal-title">${title}</h3>
        <button class="modal-close" aria-label="Close modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">${content}</div>
      ${footer ? `<div class="modal-footer" style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;padding-top:20px;border-top:1px solid var(--border-muted);">${footer}</div>` : ''}
    </div>
  `;

  const closeBtn = overlay.querySelector('.modal-close');
  const close = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
    if (onClose) onClose();
  };

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  return {
    close,
    element: overlay,
    body: overlay.querySelector('.modal-body')
  };
}

export function confirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) {
  return new Promise((resolve) => {
    const footer = `
      <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
      <button class="btn btn-${type === 'danger' ? 'danger' : 'primary'}" data-action="confirm">${confirmText}</button>
    `;
    
    const modal = createModal({ title, content: `<p style="color:var(--text-secondary);">${message}</p>`, footer, size: 'sm' });
    
    modal.element.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.close();
        resolve(btn.dataset.action === 'confirm');
      });
    });
  });
}

export function promptDialog({ title, message, placeholder, defaultValue = '', type = 'text' }) {
  return new Promise((resolve) => {
    const footer = `
      <button class="btn btn-secondary" data-action="cancel">Cancel</button>
      <button class="btn btn-primary" data-action="confirm">OK</button>
    `;
    
    const modal = createModal({ 
      title, 
      content: `<p style="color:var(--text-secondary);margin-bottom:16px;">${message}</p><input type="${type}" class="form-input" placeholder="${placeholder}" value="${defaultValue}" autofocus>`, 
      footer, 
      size: 'sm' 
    });
    
    const input = modal.body.querySelector('input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        modal.close();
        resolve(input.value);
      }
    });
    
    modal.element.querySelector('[data-action="confirm"]').addEventListener('click', () => {
      modal.close();
      resolve(input.value);
    });
    
    modal.element.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      modal.close();
      resolve(null);
    });
  });
}