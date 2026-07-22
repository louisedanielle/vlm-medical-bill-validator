const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  text: {
    type: String,
    required: true
  },
  extractedText: {
    type: String
  },
  fileInfo: {
    fileName: String,
    fileSize: Number,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
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

// Fix: Update timestamp before saving
PolicySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Policy', PolicySchema);