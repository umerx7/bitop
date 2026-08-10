import api from './api.js';

class AuthManager {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(l => l(this.user, this.isAuthenticated));
  }

  async init() {
    const token = localStorage.getItem('bitop_token');
    const refreshToken = localStorage.getItem('bitop_refresh_token');
    
    if (token) {
      api.setTokens(token, refreshToken);
      try {
        const response = await api.getMe();
        if (response.success) {
          this.setUser(response.user);
        }
      } catch (error) {
        console.error('Auth init failed:', error);
        this.clearAuth();
      }
    }
  }

  setUser(user) {
    this.user = user;
    this.isAuthenticated = true;
    localStorage.setItem('bitop_user', JSON.stringify(user));
    this.notify();
  }

  setTokens(token, refreshToken) {
    localStorage.setItem('bitop_token', token);
    localStorage.setItem('bitop_refresh_token', refreshToken);
    api.setTokens(token, refreshToken);
  }

  clearAuth() {
    this.user = null;
    this.isAuthenticated = false;
    localStorage.removeItem('bitop_token');
    localStorage.removeItem('bitop_refresh_token');
    localStorage.removeItem('bitop_user');
    api.clearTokens();
    this.notify();
  }

  async login(email, password, rememberMe = false) {
    const response = await api.login({ email, password, rememberMe });
    if (response.success) {
      this.setTokens(response.token, response.refreshToken);
      this.setUser(response.user);
    }
    return response;
  }

  async register(name, email, password, referralCode = '') {
    const response = await api.register({ name, email, password, referralCode });
    if (response.success) {
      this.setTokens(response.token, response.refreshToken);
      this.setUser(response.user);
    }
    return response;
  }

  async logout() {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    this.clearAuth();
  }

  async updateProfile(data) {
    const response = await api.updateProfile(data);
    if (response.success) {
      this.setUser({ ...this.user, ...data });
    }
    return response;
  }

  async updatePreferences(prefs) {
    const response = await api.updatePreferences(prefs);
    if (response.success && this.user) {
      this.user.preferences = response.preferences;
      localStorage.setItem('bitop_user', JSON.stringify(this.user));
      this.notify();
    }
    return response;
  }

  getUser() {
    return this.user;
  }

  hasRole(role) {
    return this.user?.role === role;
  }

  isAdmin() {
    return this.user?.role === 'admin';
  }
}

const auth = new AuthManager();
export default auth;