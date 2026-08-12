const mongoose = require('mongoose');

const publicChatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  isAiResponse: {
    type: Boolean,
    default: false
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublicChatMessage'
  }
}, {
  timestamps: true
});

publicChatMessageSchema.index({ createdAt: -1 });
publicChatMessageSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('PublicChatMessage', publicChatMessageSchema);