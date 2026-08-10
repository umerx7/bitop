const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validateRegister, validateLogin, validateObjectId } = require('../middleware/validation');
const { generateToken, generateRefreshToken, hashToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/email');
const { AuditLog } = require('../models/Settings');

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  user.lastLogin = Date.now();
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.save({ validateBeforeSave: false });

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        preferences: user.preferences,
        balances: user.balances,
        referralCode: user.referralCode
      }
    });
};

router.post('/register', validateRegister, async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const referralCodeGen = require('crypto').randomBytes(4).toString('hex').toUpperCase();

    user = await User.create({
      name,
      email,
      password,
      referralCode: referralCodeGen,
      referredBy
    });

    await AuditLog.create({
      admin: user._id,
      action: 'USER_REGISTERED',
      resource: 'User',
      resourceId: user._id,
      details: { email: user.email, referredBy: referredBy?.toString() },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account temporarily locked. Please try again later.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000;
      }
      await user.save({ validateBeforeSave: false });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    await AuditLog.create({
      admin: user._id,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user._id,
      details: { rememberMe },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

router.post('/logout', protect, async (req, res) => {
  res
    .clearCookie('token')
    .clearCookie('refreshToken')
    .json({
      success: true,
      message: 'Logged out successfully'
    });
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('referredBy', 'name email');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        preferences: user.preferences,
        balances: user.balances,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralEarnings: user.referralEarnings,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/verify-email/:token', async (req, res) => {
  try {
    const verificationToken = hashToken(req.params.token);

    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy);
      if (referrer) {
        referrer.referralEarnings += 10;
        await referrer.save({ validateBeforeSave: false });
      }
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
});

router.post('/resend-verification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user, resetToken);
      res.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const resetToken = hashToken(req.params.token);

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.put('/preferences', protect, async (req, res) => {
  try {
    const { theme, currency, notifications } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'preferences.theme': theme,
          'preferences.currency': currency,
          'preferences.notifications': notifications
        }
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

module.exports = router;