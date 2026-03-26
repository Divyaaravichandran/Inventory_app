const mongoose = require('mongoose');

const riceSchema = new mongoose.Schema({
  riceName: {
    type: String,
    required: true,
    trim: true
  },
  riceType: {
    type: String,
    required: true,
    enum: ['Basmati', 'Sona Masoori', 'Jasmine', 'Brown Rice', 'Parboiled', 'Other']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  ratePerKg: {
    type: Number,
    default: 0,
    min: 0
  },
  bagsStock: {
    '5kg': { type: Number, default: 0, min: 0 },
    '10kg': { type: Number, default: 0, min: 0 },
    '25kg': { type: Number, default: 0, min: 0 },
    '75kg': { type: Number, default: 0, min: 0 }
  },
  godownId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Godown',
    required: true
  },
  productionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['in_production', 'ready', 'sold'],
    default: 'ready'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rice', riceSchema);
