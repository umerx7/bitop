const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { AuditLog } = require('../models/Settings');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    if (req.user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account temporarily locked. Please try again later.'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch (error) {
      // Token invalid, continue without user
    }
  }

  next();
};

const logAudit = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      if (req.user && req.user.role === 'admin') {
        AuditLog.create({
          admin: req.user._id,
          action,
          resource,
          resourceId: req.params.id || req.body._id,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.method !== 'GET' ? req.body : undefined,
            query: req.query
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent')
        }).catch(err => console.error('Audit log error:', err));
      }
      originalSend.call(this, data);
    };
    next();
  };
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  logAudit
};