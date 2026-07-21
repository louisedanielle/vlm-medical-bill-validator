const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    default: '' // Store the raw extracted text from PDF
  },
  fileInfo: {
    fileName: String,
    fileSize: Number,
    fileType: String,
    uploadedAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Policy', policySchema);