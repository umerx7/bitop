const { Server } = require('socket.io');
const coingeckoService = require('./coingecko');

class WebSocketService {
  constructor() {
    this.io = null;
    this.priceInterval = null;
    this.connectedClients = new Map();
    this.subscriptions = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, {
        socket,
        subscriptions: new Set(),
        userId: null,
        joinedAt: Date.now()
      });

      socket.on('subscribe', (data) => this.handleSubscribe(socket, data));
      socket.on('unsubscribe', (data) => this.handleUnsubscribe(socket, data));
      socket.on('auth', (data) => this.handleAuth(socket, data));
      socket.on('chat:join', (data) => this.handleChatJoin(socket, data));
      socket.on('chat:message', (data) => this.handleChatMessage(socket, data));
      socket.on('chat:typing', (data) => this.handleChatTyping(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });

    this.startPriceUpdates();
    console.log('WebSocket service initialized');
  }

  handleSubscribe(socket, data) {
    const { symbols, channels } = data;
    const client = this.connectedClients.get(socket.id);
    if (!client) return;

    if (symbols) {
      symbols.forEach(symbol => {
        const normalized = symbol.toUpperCase();
        client.subscriptions.add(normalized);
        if (!this.subscriptions.has(normalized)) {
          this.subscriptions.set(normalized, new Set());
        }
        this.subscriptions.get(normalized).add(socket.id);
      });
    }

    if (channels) {
      channels.forEach(channel => {
        client.subscriptions.add(channel);
        if (!this.subscriptions.has(channel)) {
          this.subscriptions.set(channel, new Set());
        }
        this.subscriptions.get(channel).add(socket.id);
      });
    }

    socket.emit('subscribed', { symbols: Array.from(client.subscriptions) });
  }

  handleUnsubscribe(socket, data) {
    const { symbols, channels } = data;
    const client = this.connectedClients.get(socket.id);
    if (!client) return;

    const toUnsubscribe = [...(symbols || []), ...(channels || [])];
    toUnsubscribe.forEach(item => {
      const normalized = item.toUpperCase();
      client.subscriptions.delete(normalized);
      if (this.subscriptions.has(normalized)) {
        this.subscriptions.get(normalized).delete(socket.id);
        if (this.subscriptions.get(normalized).size === 0) {
          this.subscriptions.delete(normalized);
        }
      }
    });
  }

  handleAuth(socket, data) {
    const { token } = data;
    const client = this.connectedClients.get(socket.id);
    if (!client || !token) return;

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      client.userId = decoded.id;
      socket.emit('auth:success', { userId: decoded.id });
    } catch (error) {
      socket.emit('auth:error', { message: 'Invalid token' });
    }
  }

  handleChatJoin(socket, data) {
    const { sessionId } = data;
    const client = this.connectedClients.get(socket.id);
    if (!client || !client.userId) return;

    socket.join(`chat:${sessionId}`);
    socket.emit('chat:joined', { sessionId });
  }

  handleChatMessage(socket, data) {
    const { sessionId, message } = data;
    const client = this.connectedClients.get(socket.id);
    if (!client || !client.userId) return;

    this.io.to(`chat:${sessionId}`).emit('chat:message', {
      sessionId,
      message,
      senderId: client.userId,
      timestamp: Date.now()
    });
  }

  handleChatTyping(socket, data) {
    const { sessionId } = data;
    const client = this.connectedClients.get(socket.id);
    if (!client || !client.userId) return;

    socket.to(`chat:${sessionId}`).emit('chat:typing', {
      sessionId,
      userId: client.userId
    });
  }

  handleDisconnect(socket) {
    const client = this.connectedClients.get(socket.id);
    if (client) {
      client.subscriptions.forEach(sub => {
        if (this.subscriptions.has(sub)) {
          this.subscriptions.get(sub).delete(socket.id);
          if (this.subscriptions.get(sub).size === 0) {
            this.subscriptions.delete(sub);
          }
        }
      });
      this.connectedClients.delete(socket.id);
    }
    console.log(`Client disconnected: ${socket.id}`);
  }

  startPriceUpdates() {
    if (this.priceInterval) {
      clearInterval(this.priceInterval);
    }

    this.priceInterval = setInterval(async () => {
      await this.broadcastPriceUpdates();
    }, 5000);

    this.priceInterval.unref();
  }

  async broadcastPriceUpdates() {
    if (this.subscriptions.size === 0) return;

    const symbols = Array.from(this.subscriptions.keys())
      .filter(s => /^[A-Z]{2,10}$/.test(s))
      .slice(0, 50);

    if (symbols.length === 0) return;

    try {
      const prices = await coingeckoService.getPrices(symbols);
      const formatted = coingeckoService.formatPriceData(prices, symbols);

      Object.entries(formatted).forEach(([symbol, data]) => {
        if (this.subscriptions.has(symbol)) {
          this.subscriptions.get(symbol).forEach(socketId => {
            const client = this.connectedClients.get(socketId);
            if (client) {
              client.socket.emit('price:update', { symbol, ...data });
            }
          });
        }
      });

      if (this.subscriptions.has('global')) {
        const global = await coingeckoService.getGlobalData();
        this.subscriptions.get('global').forEach(socketId => {
          const client = this.connectedClients.get(socketId);
          if (client) {
            client.socket.emit('global:update', global.data);
          }
        });
      }
    } catch (error) {
      console.error('Price update error:', error.message);
    }
  }

  broadcastToUser(userId, event, data) {
    this.connectedClients.forEach((client, socketId) => {
      if (client.userId === userId.toString()) {
        client.socket.emit(event, data);
      }
    });
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  broadcastToAdmins(event, data) {
    this.connectedClients.forEach((client, socketId) => {
      if (client.userId) {
        // Check if admin - would need user lookup
        client.socket.emit(event, data);
      }
    });
  }

  getConnectedCount() {
    return this.connectedClients.size;
  }

  getSubscriptionCount(symbol) {
    return this.subscriptions.has(symbol) ? this.subscriptions.get(symbol).size : 0;
  }

  shutdown() {
    if (this.priceInterval) {
      clearInterval(this.priceInterval);
    }
    if (this.io) {
      this.io.close();
    }
  }
}

module.exports = new WebSocketService();