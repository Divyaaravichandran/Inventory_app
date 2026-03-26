const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerContact: {
    type: String,
    required: true,
    trim: true
  },
  customerAddress: {
    type: String,
    trim: true
  },
  riceType: {
    type: String,
    required: true,
    trim: true
  },
  paddyId: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  vehicleNumber: {
    type: String,
    trim: true
  },
  driverName: {
    type: String,
    trim: true
  },
  destination: {
    type: String,
    trim: true
  },
  dispatchDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'delivered'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'pending'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate balance before saving
salesSchema.pre('save', function(next) {
  this.balanceAmount = this.totalAmount - this.paidAmount;
  if (this.paidAmount === 0) {
    this.paymentStatus = 'pending';
  } else if (this.paidAmount < this.totalAmount) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'paid';
  }
  next();
});

module.exports = mongoose.model('Sales', salesSchema);
