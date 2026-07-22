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
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Policy', PolicySchema);