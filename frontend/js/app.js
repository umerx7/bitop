import auth from './utils/auth.js';
import ws from './utils/websocket.js';
import store from './utils/store.js';
import { showToast } from './components/toast.js';

class App {
  constructor() {
    this.currentPage = null;
    this.pages = new Map();
    this.authUnsubscribe = null;
  }

  async init() {
    this.authUnsubscribe = auth.subscribe((user, isAuthenticated) => {
      this.handleAuthChange(user, isAuthenticated);
    });
    
    await auth.init();
    
    // Manually trigger handleAuthChange for initial state
    this.handleAuthChange(auth.user, auth.isAuthenticated);

    this.setupRouting();
    this.setupGlobalListeners();
    this.setupDropdowns();
    
    if (auth.isAuthenticated) {
      ws.connect();
    }

    this.renderPage();
  }

  handleAuthChange(user, isAuthenticated) {
    this.updateNavigation(user, isAuthenticated);
    
    if (isAuthenticated) {
      ws.connect();
    } else {
      ws.disconnect();
    }

    const publicPages = ['landing', 'login', 'register', 'forgot-password', 'reset-password', 'verify-email'];
    const currentPath = window.location.pathname.slice(1) || 'landing';
    
    if (!isAuthenticated && !publicPages.includes(currentPath)) {
      this.navigate('/login');
    } else if (isAuthenticated && (currentPath === 'login' || currentPath === 'register')) {
      this.navigate('/dashboard');
    }
  }

  updateNavigation(user, isAuthenticated) {
    const navAuth = document.getElementById('nav-auth');
    const navUser = document.getElementById('nav-user');
    const userName = document.getElementById('user-name');
    const userBalance = document.getElementById('user-balance');

    if (isAuthenticated && user) {
      navAuth.style.display = 'none';
      navUser.style.display = 'flex';
      if (userName) userName.textContent = user.name;
      if (userBalance) this.updateBalanceDisplay(user);
    } else {
      navAuth.style.display = 'flex';
      navUser.style.display = 'none';
    }
  }

  updateBalanceDisplay(user) {
    const balanceEl = document.getElementById('user-balance');
    if (!balanceEl || !user.balances) return;
    
    const usdt = user.balances.find(b => b.currency === 'USDT');
    const btc = user.balances.find(b => b.currency === 'BTC');
    
    let text = '';
    if (usdt) text += `$${usdt.available.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (btc) text += ` / ${btc.available.toFixed(6)} BTC`;
    
    balanceEl.textContent = text || '$0.00';
  }

  setupRouting() {
    window.addEventListener('popstate', () => this.renderPage());
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href') || link.dataset.href;
        if (href) {
          this.navigate(href);
        }
      }
    });
  }

  setupGlobalListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
        this.closeMobileMenu();
      }
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMain = document.querySelector('.nav-main');
    if (mobileMenuBtn && navMain) {
      mobileMenuBtn.addEventListener('click', () => {
        navMain.classList.toggle('open');
        mobileMenuBtn.setAttribute('aria-expanded', navMain.classList.contains('open'));
      });
    }

    // Close mobile menu on nav link click
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('.nav-main .nav-link');
      if (navLink) {
        this.closeMobileMenu();
      }
    });
  }

  closeMobileMenu() {
    const navMain = document.querySelector('.nav-main');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (navMain && navMain.classList.contains('open')) {
      navMain.classList.remove('open');
      if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
  }

  setupDropdowns() {
    // User dropdown toggle
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
        userMenuBtn.setAttribute('aria-expanded', userDropdown.classList.contains('active'));
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('user-dropdown');
      const btn = document.getElementById('user-menu-btn');
      if (dropdown && dropdown.classList.contains('active') && !dropdown.contains(e.target) && e.target !== btn && !btn?.contains(e.target)) {
        dropdown.classList.remove('active');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Logout button
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (e) {
          console.error('Logout error:', e);
        }
        localStorage.removeItem('bitop_token');
        localStorage.removeItem('bitop_refresh_token');
        localStorage.removeItem('bitop_user');
        window.location.href = '/';
      });
    }
  }

  navigate(path) {
    // If authenticated user tries to access login/register, redirect to dashboard
    if (auth.isAuthenticated && (path === '/login' || path === '/register')) {
      path = '/dashboard';
    }
    window.history.pushState({}, '', path);
    this.renderPage();
  }

  async renderPage() {
    const path = window.location.pathname.slice(1) || 'landing';
    const [pageName, ...params] = path.split('/');
    
    this.currentPage = pageName;
    
    const pageModule = await this.loadPage(pageName);
    if (pageModule) {
      const container = document.getElementById('app');
      if (container) {
        container.innerHTML = pageModule.template || '';
        if (pageModule.init) {
          await pageModule.init(params);
        }
      }
    } else {
      this.navigate('/404');
    }

    this.updateActiveNav(pageName);
    window.scrollTo(0, 0);
  }

  async loadPage(name) {
    if (this.pages.has(name)) {
      return this.pages.get(name);
    }

    try {
      const module = await import(`./pages/${name}.js`);
      const page = module.default || module;
      this.pages.set(name, page);
      return page;
    } catch (error) {
      console.error(`Failed to load page: ${name}`, error);
      return null;
    }
  }

  updateActiveNav(pageName) {
    document.querySelectorAll('[data-nav]').forEach(link => {
      link.classList.toggle('active', link.dataset.nav === pageName);
    });
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
}

const app = new App();
export default app;

document.addEventListener('DOMContentLoaded', () => app.init());