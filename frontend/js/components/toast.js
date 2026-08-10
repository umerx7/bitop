const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

export function showToast(message, type = 'info', duration = 5000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };
  
  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
  
  return toast;
}

export function showSuccess(message, duration) { return showToast(message, 'success', duration); }
export function showError(message, duration) { return showToast(message, 'error', duration); }
export function showWarning(message, duration) { return showToast(message, 'warning', duration); }
export function showInfo(message, duration) { return showToast(message, 'info', duration); }