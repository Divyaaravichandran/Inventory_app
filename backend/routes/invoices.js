const express = require('express');
const { body, validationResult } = require('express-validator');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Dealer = require('../models/Dealer');
const DealerOrder = require('../models/DealerOrder');
const { auth, adminOnly, dealerOnly } = require('../middleware/auth');

const router = express.Router();

// Admin: create invoice linked to dealer & order
router.post(
  '/',
  auth,
  adminOnly,
  [
    body('dealerId').notEmpty().withMessage('Dealer ID is required'),
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { dealerId, orderId, amount, notes } = req.body;

      const dealer = await Dealer.findOne({ dealerId });
      if (!dealer) {
        return res.status(404).json({ message: 'Dealer not found' });
      }

      const order = await DealerOrder.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Simple incremental invoice number (INV-0001)
      const count = await Invoice.countDocuments();
      const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;

      const invoice = new Invoice({
        dealer: dealer._id,
        dealerId,
        order: order._id,
        invoiceNumber,
        amount,
        notes,
        paymentStatus: 'pending',
      });

      await invoice.save();

      res.status(201).json(invoice);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Admin: list all invoices
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('dealer')
      .populate('order')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dealer: my invoices
router.get('/dealer', auth, dealerOnly, async (req, res) => {
  try {
    const invoices = await Invoice.find({ dealerId: req.user.dealerId })
      .populate('order')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: delete invoice
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await Payment.deleteMany({ invoiceId: invoice._id });
    await invoice.deleteOne();
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dealer: delete own pending invoice
router.delete('/dealer/:id', auth, dealerOnly, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    if (invoice.dealerId !== req.user.dealerId) {
      return res.status(403).json({ message: 'Not allowed to delete this invoice' });
    }
    if (invoice.paymentStatus !== 'pending') {
      return res.status(400).json({ message: 'Only pending invoices can be deleted' });
    }
    await Payment.deleteMany({ invoiceId: invoice._id });
    await invoice.deleteOne();
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

