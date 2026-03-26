const express = require('express');
const { body, validationResult } = require('express-validator');
const Sales = require('../models/Sales');
const Rice = require('../models/Rice');
const Payment = require('../models/Payment');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all sales
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const sales = await Sales.find()
      .populate('soldBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new sale
router.post('/', [
  auth,
  adminOnly,
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerContact').notEmpty().withMessage('Customer contact is required'),
  body('riceType').notEmpty().withMessage('Rice type is required'),
  body('paddyId').notEmpty().withMessage('Paddy ID is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('rate').isNumeric().withMessage('Rate must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { riceType, quantity, rate, paddyId, ...otherData } = req.body;
    const totalAmount = quantity * rate;

    const sale = new Sales({
      ...otherData,
      riceType,
      paddyId,
      quantity,
      rate,
      totalAmount,
      balanceAmount: totalAmount,
      soldBy: req.user._id
    });

    await sale.save();

    const populatedSale = await Sales.findById(sale._id)
      .populate('soldBy', 'name email');

    res.status(201).json(populatedSale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update sale (dispatch status, etc.)
router.put('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const sale = await Sales.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('soldBy', 'name email');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent sales
router.get('/recent', auth, adminOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sales = await Sales.find()
      .select('customerName riceType quantity totalAmount createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete sale
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    await Payment.deleteMany({ saleId: sale._id });
    await sale.deleteOne();
    res.json({ message: 'Sale deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
