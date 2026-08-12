const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
    this.token = null;
    this.refreshToken = null;
  }

  setTokens(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include'
    };

    try {
      let response = await fetch(url, config);

      if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/')) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          config.headers['Authorization'] = `Bearer ${this.token}`;
          response = await fetch(url, config);
        }
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `HTTP error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        this.token = data.token;
        this.refreshToken = data.refreshToken;
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    this.clearTokens();
    return false;
  }

  // Auth
  async register(data) { return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }); }
  async login(data) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }); }
  async logout() { return this.request('/auth/logout', { method: 'POST' }); }
  async getMe() { return this.request('/auth/me'); }
  async verifyEmail(token) { return this.request(`/auth/verify-email/${token}`, { method: 'POST' }); }
  async resendVerification() { return this.request('/auth/resend-verification', { method: 'POST' }); }
  async forgotPassword(email) { return this.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }); }
  async resetPassword(token, password) { return this.request(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify({ password }) }); }
  async updatePassword(currentPassword, newPassword) { return this.request('/auth/update-password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }); }
  async updatePreferences(prefs) { return this.request('/auth/preferences', { method: 'PUT', body: JSON.stringify(prefs) }); }

  // Market
  async getTickers() { return this.request('/market/tickers'); }
  async getTicker(symbol) { return this.request(`/market/ticker/${symbol}`); }
  async getCandles(symbol, interval = '1h', limit = 200) { return this.request(`/market/candles/${symbol}?interval=${interval}&limit=${limit}`); }
  async getOrderbook(symbol, limit = 20) { return this.request(`/market/orderbook/${symbol}?limit=${limit}`); }
  async getTrades(symbol, limit = 50) { return this.request(`/market/trades/${symbol}?limit=${limit}`); }
  async getGlobal() { return this.request('/market/global'); }
  async getTrending() { return this.request('/market/trending'); }
  async getExchangeRates() { return this.request('/market/exchange-rates'); }
  async searchSymbols(q) { return this.request(`/market/search?q=${encodeURIComponent(q)}`); }

  // Trades
  async getPairs() { return this.request('/trades/pairs'); }
  async getOrderbook(pair, limit = 50) { return this.request(`/trades/orderbook/${pair}?limit=${limit}`); }
  async getHistory(pair, limit = 100, interval = '1h') { return this.request(`/trades/history/${pair}?limit=${limit}&interval=${interval}`); }
  async createTrade(data) { return this.request('/trades', { method: 'POST', body: JSON.stringify(data) }); }
  async getTrades(params = {}) { 
    const qs = new URLSearchParams(params).toString();
    return this.request(`/trades?${qs}`); 
  }
  async getOpenTrades() { return this.request('/trades/open'); }
  async getTrade(id) { return this.request(`/trades/${id}`); }
  async cancelTrade(id) { return this.request(`/trades/${id}`, { method: 'DELETE' }); }
  async getTradeStats() { return this.request('/trades/stats/summary'); }

  // Wallet
  async getBalances() { return this.request('/wallet/balances'); }
  async getDeposits(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/wallet/deposits?${qs}`); }
  async getDepositAddress(currency, network) { return this.request(`/wallet/deposit/address?currency=${currency}&network=${network}`); }
  async createWithdrawal(data) { return this.request('/wallet/withdraw', { method: 'POST', body: JSON.stringify(data) }); }
  async getWithdrawals(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/wallet/withdrawals?${qs}`); }
  async verifyWithdrawal(id, data) { return this.request(`/wallet/withdraw/${id}/verify`, { method: 'POST', body: JSON.stringify(data) }); }
  async cancelWithdrawal(id) { return this.request(`/wallet/withdraw/${id}`, { method: 'DELETE' }); }
  async getPaymentMethods() { return this.request('/wallet/payment-methods'); }
  async createPaymentMethod(data) { return this.request('/wallet/payment-methods', { method: 'POST', body: JSON.stringify(data) }); }
  async updatePaymentMethod(id, data) { return this.request(`/wallet/payment-methods/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deletePaymentMethod(id) { return this.request(`/wallet/payment-methods/${id}`, { method: 'DELETE' }); }
  async getNetworks(currency) { return this.request(`/wallet/networks/${currency}`); }
  async getFees(currency) { return this.request(`/wallet/fees/${currency}`); }

  // Payment (Fiat + Crypto)
  async getPaymentMethods() { return this.request('/payment/methods'); }
  async createDeposit(data) { return this.request('/payment/deposit', { method: 'POST', body: JSON.stringify(data) }); }
  async createWithdrawalFiat(data) { return this.request('/payment/withdraw', { method: 'POST', body: JSON.stringify(data) }); }
  async getTransactionHistory(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/payment/history?${qs}`); }
  async simulateTransaction(id, action) { return this.request(`/payment/simulate/${id}`, { method: 'POST', body: JSON.stringify({ action }) }); }
  async getCryptoAddresses() { return this.request('/payment/crypto-addresses'); }

  // Chat
  async createChatSession(data) { return this.request('/chat/session', { method: 'POST', body: JSON.stringify(data) }); }
  async getChatSessions(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/chat/sessions?${qs}`); }
  async getChatSession(id) { return this.request(`/chat/sessions/${id}`); }
  async sendMessage(sessionId, message, page) { return this.request(`/chat/sessions/${sessionId}/messages`, { method: 'POST', body: JSON.stringify({ message, page }) }); }
  async markAsRead(sessionId) { return this.request(`/chat/sessions/${sessionId}/read`, { method: 'PUT' }); }
  async rateSession(id, score, feedback) { return this.request(`/chat/sessions/${id}/rate`, { method: 'POST', body: JSON.stringify({ score, feedback }) }); }
  async closeSession(id) { return this.request(`/chat/sessions/${id}`, { method: 'DELETE' }); }
  async getFaq() { return this.request('/chat/faq'); }
  async getChatStatus() { return this.request('/chat/status'); }

  // Public Chat (AI Community)
  async getPublicMessages(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/public-chat/messages?${qs}`); }
  async sendPublicMessage(message) { return this.request('/public-chat/messages', { method: 'POST', body: JSON.stringify({ message }) }); }
  async getOnlineUsers() { return this.request('/public-chat/users-online'); }

  // User
  async getProfile() { return this.request('/user/profile'); }
  async updateProfile(data) { return this.request('/user/profile', { method: 'PUT', body: JSON.stringify(data) }); }
  async getTransactions(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/user/transactions?${qs}`); }
  async getActivity(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/user/activity?${qs}`); }
  async enable2FA() { return this.request('/user/2fa/enable', { method: 'POST' }); }
  async verify2FA(token) { return this.request('/user/2fa/verify', { method: 'POST', body: JSON.stringify({ token }) }); }
  async disable2FA(token, password) { return this.request('/user/2fa/disable', { method: 'POST', body: JSON.stringify({ token, password }) }); }
  async getApiKeys() { return this.request('/user/api-keys'); }
  async createApiKey(data) { return this.request('/user/api-keys', { method: 'POST', body: JSON.stringify(data) }); }
  async deleteApiKey(id) { return this.request(`/user/api-keys/${id}`, { method: 'DELETE' }); }
  async getNotifications(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/user/notifications?${qs}`); }
  async markNotificationRead(id) { return this.request(`/user/notifications/${id}/read`, { method: 'PUT' }); }
  async markAllNotificationsRead() { return this.request('/user/notifications/read-all', { method: 'PUT' }); }

  // Referral
  async getReferralInfo() { return this.request('/referral/info'); }
  async getReferrals(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/referral/referrals?${qs}`); }
  async getEarnings(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/referral/earnings?${qs}`); }
  async getReferralLink() { return this.request('/referral/link'); }
  async withdrawReferral() { return this.request('/referral/withdraw', { method: 'POST' }); }

  // KYC
  async getKycStatus() { return this.request('/kyc/status'); }
  async submitKyc(data) { return this.request('/kyc/submit', { method: 'POST', body: JSON.stringify(data) }); }
  async getRequirements(level) { return this.request(`/kyc/requirements/${level}`); }
  async getLimits() { return this.request('/kyc/limits'); }

  // Admin
  async getAdminDashboard() { return this.request('/admin/dashboard'); }
  async getUsers(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/admin/users?${qs}`); }
  async getUser(id) { return this.request(`/admin/users/${id}`); }
  async updateUser(id, data) { return this.request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async adjustBalance(id, data) { return this.request(`/admin/users/${id}/balance`, { method: 'POST', body: JSON.stringify(data) }); }
  async deleteUser(id) { return this.request(`/admin/users/${id}`, { method: 'DELETE' }); }
  async getAdminWithdrawals(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/admin/withdrawals?${qs}`); }
  async updateWithdrawal(id, data) { return this.request(`/admin/withdrawals/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async getAdminDeposits(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/admin/deposits?${qs}`); }
  async updateDeposit(id, data) { return this.request(`/admin/deposits/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async getAdminTrades(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/admin/trades?${qs}`); }
  async getAdminChats(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/admin/chats?${qs}`); }
  async assignChat(id) { return this.request(`/admin/chats/${id}/assign`, { method: 'POST' }); }
  async sendAdminChatMessage(id, message) { return this.request(`/admin/chats/${id}/messages`, { method: 'POST', body: JSON.stringify({ message }) }); }
  async closeChat(id) { return this.request(`/admin/chats/${id}/close`, { method: 'PUT' }); }
  async getSettings() { return this.request('/admin/settings'); }
  async updateSetting(key, value) { return this.request(`/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }); }
  async getAuditLogs(params = {}) { const qs = new URLSearchParams(params).toString(); return this.request(`/admin/audit-logs?${qs}`); }
  async getAdminStats(days = 30) { return this.request(`/admin/stats?days=${days}`); }
  async setMaintenance(enabled, message) { return this.request('/admin/maintenance', { method: 'POST', body: JSON.stringify({ enabled, message }) }); }
}

const api = new ApiClient();
export default api;