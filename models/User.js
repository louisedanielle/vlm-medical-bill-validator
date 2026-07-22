const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', UserSchema);