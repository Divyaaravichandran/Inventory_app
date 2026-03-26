const mongoose = require('mongoose');

const generatePaddyId = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PAD-${datePart}-${randPart}`;
};

const paddySchema = new mongoose.Schema({
  paddyId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  paddyType: {
    type: String,
    required: true,
    enum: ['Basmati', 'Sona Masoori', 'Jasmine', 'Brown Rice', 'Parboiled', 'Other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseRate: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseAmount: {
    type: Number,
    required: true,
    min: 0
  },
  qualityGrade: {
    type: String,
    required: true,
    enum: ['A+', 'A', 'B', 'C']
  },
  moisturePercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  sellerName: {
    type: String,
    required: true,
    trim: true
  },
  sellerContact: {
    type: String,
    required: true,
    trim: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  godownId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Godown',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

paddySchema.pre('validate', function(next) {
  if (!this.paddyId) {
    this.paddyId = generatePaddyId();
  }
  const weightTons = Number(this.weight) || 0;
  const ratePerKg = Number(this.purchaseRate) || 0;
  this.purchaseAmount = weightTons * 1000 * ratePerKg;
  next();
});

module.exports = mongoose.model('Paddy', paddySchema);
