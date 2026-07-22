const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: [true, 'Company ID is required'],
    unique: true,
    index: true,
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Company Name is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Remove password when converting to JSON
UserSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);