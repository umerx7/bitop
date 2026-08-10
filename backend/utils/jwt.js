const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  generateRefreshToken,
  hashToken,
  generateRandomToken
};