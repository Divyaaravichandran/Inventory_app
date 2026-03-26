const express = require('express');
const { body, validationResult } = require('express-validator');
const Dealer = require('../models/Dealer');
const DealerOrder = require('../models/DealerOrder');
const Invoice = require('../models/Invoice');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Helper to generate incremental dealer IDs like DLR0001
async function generateDealerId() {
  const count = await Dealer.countDocuments();
  const nextNumber = count + 1;
  return `DLR${String(nextNumber).padStart(4, '0')}`;
}

// Get all dealers
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const dealers = await Dealer.find().sort({ createdAt: -1 });
    res.json(dealers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create dealer
router.post(
  '/',
  auth,
  adminOnly,
  [
    body('dealerName').notEmpty().withMessage('Dealer name is required'),
    body('businessName').notEmpty().withMessage('Business name is required'),
    body('contactNumber').notEmpty().withMessage('Contact number is required'),
    body('location').notEmpty().withMessage('Location is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const dealerId = await generateDealerId();

      const dealer = new Dealer({
        dealerId,
        dealerName: req.body.dealerName,
        businessName: req.body.businessName,
        contactNumber: req.body.contactNumber,
        location: req.body.location,
        gstNumber: req.body.gstNumber,
        status: req.body.status || 'active',
      });

      await dealer.save();

      res.status(201).json(dealer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update dealer
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const dealer = await Dealer.findByIdAndUpdate(
      req.params.id,
      {
        dealerName: req.body.dealerName,
        businessName: req.body.businessName,
        contactNumber: req.body.contactNumber,
        location: req.body.location,
        gstNumber: req.body.gstNumber,
        status: req.body.status,
      },
      { new: true, runValidators: true }
    );

    if (!dealer) {
      return res.status(404).json({ message: 'Dealer not found' });
    }

    res.json(dealer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Disable dealer (soft delete)
router.patch('/:id/disable', auth, adminOnly, async (req, res) => {
  try {
    const dealer = await Dealer.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );

    if (!dealer) {
      return res.status(404).json({ message: 'Dealer not found' });
    }

    res.json(dealer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete dealer permanently
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const dealer = await Dealer.findByIdAndDelete(req.params.id);
    if (!dealer) {
      return res.status(404).json({ message: 'Dealer not found' });
    }
    // Note: We might also want to remove related orders/invoices to avoid orphan records,
    // but based on "completely removed from database", deleting the dealer document achieves this.
    res.json({ message: 'Dealer permanently deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dealer selection view: purchase history, orders, invoices
router.get('/:id/overview', auth, adminOnly, async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.params.id);
    if (!dealer) {
      return res.status(404).json({ message: 'Dealer not found' });
    }

    const orders = await DealerOrder.find({ dealer: dealer._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const invoices = await Invoice.find({ dealer: dealer._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      dealer,
      orders,
      invoices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

