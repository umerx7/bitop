import auth from './auth.js';
import store from './store.js';

class WebSocketManager {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.subscriptions = new Set();
    this.channels = new Map();
    this.isConnecting = false;
  }

  connect() {
    if (this.socket?.connected || this.isConnecting) return;
    
    this.isConnecting = true;
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: false,
      auth: { token: localStorage.getItem('bitop_token') }
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.resubscribe();
      
      if (auth.isAuthenticated) {
        this.socket.emit('auth', { token: localStorage.getItem('bitop_token') });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnecting = false;
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.handleReconnect();
    });

    this.setupEventHandlers();
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  resubscribe() {
    this.subscriptions.forEach(sub => this.socket.emit('subscribe', sub));
  }

  setupEventHandlers() {
    this.socket.on('price:update', (data) => {
      store.set(`price_${data.symbol}`, data);
      this.emit(`price:${data.symbol}`, data);
    });

    this.socket.on('global:update', (data) => {
      store.set('global_market', data);
      this.emit('global:update', data);
    });

    this.socket.on('trade:update', (data) => {
      this.emit('trade:update', data);
    });

    this.socket.on('trade:cancelled', (data) => {
      this.emit('trade:cancelled', data);
    });

    this.socket.on('withdrawal:created', (data) => {
      this.emit('withdrawal:created', data);
    });

    this.socket.on('withdrawal:updated', (data) => {
      this.emit('withdrawal:updated', data);
    });

    this.socket.on('withdrawal:cancelled', (data) => {
      this.emit('withdrawal:cancelled', data);
    });

    this.socket.on('deposit:completed', (data) => {
      this.emit('deposit:completed', data);
    });

    this.socket.on('balance:updated', (data) => {
      this.emit('balance:updated', data);
    });

    this.socket.on('chat:message', (data) => {
      this.emit(`chat:${data.sessionId}`, data);
    });

    this.socket.on('chat:new_message', (data) => {
      this.emit('chat:new_message', data);
    });

    this.socket.on('chat:admin_joined', (data) => {
      this.emit('chat:admin_joined', data);
    });

    this.socket.on('chat:admin_assigned', (data) => {
      this.emit('chat:admin_assigned', data);
    });

    this.socket.on('chat:closed', (data) => {
      this.emit('chat:closed', data);
    });

    this.socket.on('chat:typing', (data) => {
      this.emit('chat:typing', data);
    });

    this.socket.on('auth:success', (data) => {
      console.log('WebSocket auth success:', data);
    });

    this.socket.on('auth:error', (data) => {
      console.error('WebSocket auth error:', data);
    });

    this.socket.on('subscribed', (data) => {
      console.log('Subscribed:', data);
    });

    this.socket.on('maintenance:update', (data) => {
      store.set('maintenance', data);
      this.emit('maintenance:update', data);
    });

    this.socket.on('account:updated', (data) => {
      this.emit('account:updated', data);
    });
  }

  subscribe(symbols = [], channels = []) {
    const data = {};
    if (symbols.length) data.symbols = symbols;
    if (channels.length) data.channels = channels;
    
    this.subscriptions.add(data);
    
    if (this.socket?.connected) {
      this.socket.emit('subscribe', data);
    }
  }

  unsubscribe(symbols = [], channels = []) {
    const data = {};
    if (symbols.length) data.symbols = symbols;
    if (channels.length) data.channels = channels;
    
    this.subscriptions.delete(data);
    
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe', data);
    }
  }

  joinChat(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('chat:join', { sessionId });
    }
  }

  sendChatMessage(sessionId, message) {
    if (this.socket?.connected) {
      this.socket.emit('chat:message', { sessionId, message });
    }
  }

  sendTyping(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('chat:typing', { sessionId });
    }
  }

  on(event, callback) {
    if (!this.channels.has(event)) {
      this.channels.set(event, new Set());
    }
    this.channels.get(event).add(callback);
    return () => this.channels.get(event).delete(callback);
  }

  emit(event, data) {
    const listeners = this.channels.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscriptions.clear();
    this.channels.clear();
  }

  get connected() {
    return this.socket?.connected ?? false;
  }
}

const ws = new WebSocketManager();
export default ws;