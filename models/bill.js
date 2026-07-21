const mongoose = require('mongoose');

const chargeSchema = new mongoose.Schema({
  date: String,
  code: String,
  description: String,
  category: String,
  amount: Number,
  discount: Number
});

const billSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    index: true
  },
  hospital: String,
  billNumber: String,
  patientName: String,
  patientId: String,
  admissionDate: String,
  dischargeDate: String,
  depositPaid: Number,
  grandTotal: Number,
  balanceDue: Number,
  charges: [chargeSchema],
  notes: String,
  validationResult: {
    approved: Boolean,
    complianceRate: Number,
    passed: Number,
    failed: Number,
    warnings: Number,
    reasons: [String]
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Bill', billSchema);