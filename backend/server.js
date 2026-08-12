require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const http = require('http');
const path = require('path');

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const tradeRoutes = require('./routes/trades');
const walletRoutes = require('./routes/wallet');
const paymentRoutes = require('./routes/payment');
const chatRoutes = require('./routes/chat');
const publicChatRoutes = require('./routes/publicChat');
const marketRoutes = require('./routes/market');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const referralRoutes = require('./routes/referral');
const kycRoutes = require('./routes/kyc');

const websocketService = require('./services/websocket');
const { protect, authorize } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

connectDB();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later' },
  skipSuccessfulRequests: true
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/trades', protect, tradeRoutes);
app.use('/api/wallet', protect, walletRoutes);
app.use('/api/payment', protect, paymentRoutes);
app.use('/api/chat', protect, chatRoutes);
app.use('/api/public-chat', publicChatRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/admin', protect, authorize('admin'), adminRoutes);
app.use('/api/user', protect, userRoutes);
app.use('/api/referral', protect, referralRoutes);
app.use('/api/kyc', protect, kycRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'BITOP API is running', timestamp: new Date().toISOString() });
});

app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

websocketService.initialize(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`BITOP Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;