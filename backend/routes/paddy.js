const express = require('express');
const { body, validationResult } = require('express-validator');
const Paddy = require('../models/Paddy');
const Godown = require('../models/Godown');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all paddy inward records
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const paddies = await Paddy.find()
      .populate('godownId', 'name location')
      .populate('addedBy', 'name email')
      .sort({ date: -1 });
    res.json(paddies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add paddy inward
router.post('/', [
  auth,
  adminOnly,
  body('paddyType').notEmpty().withMessage('Paddy type is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('weight').isNumeric().withMessage('Weight must be a number'),
  body('purchaseRate').isNumeric().withMessage('Purchase rate must be a number'),
  body('qualityGrade').notEmpty().withMessage('Quality grade is required'),
  body('moisturePercent').isNumeric().withMessage('Moisture percentage must be a number'),
  body('sellerName').notEmpty().withMessage('Seller name is required'),
  body('sellerContact').notEmpty().withMessage('Seller contact is required'),
  body('vehicleNumber').notEmpty().withMessage('Vehicle number is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('godownId').notEmpty().withMessage('Godown is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const godown = await Godown.findById(req.body.godownId);
    if (!godown) {
      return res.status(404).json({ message: 'Godown not found' });
    }

    // Update godown stock
    godown.currentStock += req.body.weight;
    if (godown.currentStock > godown.capacity) {
      return res.status(400).json({ message: 'Godown capacity exceeded' });
    }
    await godown.save();

    const paddy = new Paddy({
      ...req.body,
      addedBy: req.user._id
    });
    await paddy.save();

    const populatedPaddy = await Paddy.findById(paddy._id)
      .populate('godownId', 'name location')
      .populate('addedBy', 'name email');

    res.status(201).json(populatedPaddy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get paddy stock summary
router.get('/stock', auth, adminOnly, async (req, res) => {
  try {
    const stock = await Paddy.aggregate([
      {
        $group: {
          _id: '$paddyType',
          totalQuantity: { $sum: '$quantity' },
          totalWeight: { $sum: '$weight' }
        }
      }
    ]);

    const totalStock = await Paddy.aggregate([
      {
        $group: {
          _id: null,
          totalWeight: { $sum: '$weight' }
        }
      }
    ]);

    res.json({
      byType: stock,
      total: totalStock[0]?.totalWeight || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete paddy inward record
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const paddy = await Paddy.findById(req.params.id);
    if (!paddy) {
      return res.status(404).json({ message: 'Paddy record not found' });
    }

    const godown = await Godown.findById(paddy.godownId);
    if (godown) {
      godown.currentStock = Math.max(0, (godown.currentStock || 0) - (paddy.weight || 0));
      await godown.save();
    }

    await paddy.deleteOne();
    res.json({ message: 'Paddy record deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
