const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  verificationTokenExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  balances: [{
    currency: { type: String, required: true },
    available: { type: Number, default: 0 },
    locked: { type: Number, default: 0 }
  }],
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'not_submitted'],
    default: 'not_submitted'
  },
  kycDocuments: [{
    type: String,
    url: String,
    uploadedAt: Date,
    status: String
  }],
  referralCode: String,
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralEarnings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ referralCode: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

userSchema.methods.getResetPasswordToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return token;
};

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('User', userSchema);