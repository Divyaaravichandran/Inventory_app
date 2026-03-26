const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Sales = require('../models/Sales');
const Invoice = require('../models/Invoice');
const UserOrder = require('../models/UserOrder');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all payments (including user order payments)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('saleId')
      .populate('invoiceId')
      .populate('userOrderId')
      .populate('receivedBy', 'name email')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Record payment (for sale, dealer invoice, or user order)
router.post('/', [
  auth,
  adminOnly,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('customerName').notEmpty().withMessage('Customer name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { saleId, invoiceId, userOrderId, amount } = req.body;

    if (!saleId && !invoiceId && !userOrderId) {
      return res.status(400).json({ message: 'Either saleId, invoiceId, or userOrderId is required' });
    }

    let sale = null;
    let invoice = null;
    let userOrder = null;

    if (saleId) {
      sale = await Sales.findById(saleId);
      if (!sale) {
        return res.status(404).json({ message: 'Sale not found' });
      }
    }

    if (invoiceId) {
      invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
    }

    if (userOrderId) {
      userOrder = await UserOrder.findById(userOrderId);
      if (!userOrder) {
        return res.status(404).json({ message: 'User order not found' });
      }
    }

    const paymentPayload = {
      amount,
      customerName: req.body.customerName,
      paymentMethod: req.body.paymentMethod,
      referenceNumber: req.body.referenceNumber,
      notes: req.body.notes,
      receivedBy: req.user._id
    };

    if (sale) {
      paymentPayload.saleId = sale._id;
    }

    if (invoice) {
      paymentPayload.invoiceId = invoice._id;
      paymentPayload.dealerId = invoice.dealerId;
    }

    if (userOrder) {
      paymentPayload.userOrderId = userOrder._id;
      paymentPayload.orderType = 'user_order';
    }

    const payment = new Payment(paymentPayload);
    await payment.save();

    // Update sale payment status
    if (sale) {
      sale.paidAmount += amount;
      await sale.save();
    }

    // Update invoice payment status (for dealer invoices)
    if (invoice) {
      invoice.paidAmount = (invoice.paidAmount || 0) + amount;
      if (invoice.paidAmount >= invoice.amount) {
        invoice.paymentStatus = 'paid';
      } else if (invoice.paidAmount > 0) {
        invoice.paymentStatus = 'partial';
      }
      await invoice.save();
    }

    // Update user order payment status
    if (userOrder) {
      userOrder.paymentStatus = 'paid';
      await userOrder.save();
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate('saleId')
      .populate('invoiceId')
      .populate('userOrderId')
      .populate('receivedBy', 'name email');

    res.status(201).json(populatedPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment summary (including user orders)
router.get('/summary', auth, adminOnly, async (req, res) => {
  try {
    // Sales payments
    const salesPayments = await Payment.find({ saleId: { $exists: true } });
    const salesTotal = salesPayments.reduce((sum, p) => sum + p.amount, 0);

    // Dealer invoice payments
    const invoicePayments = await Payment.find({ invoiceId: { $exists: true } });
    const invoiceTotal = invoicePayments.reduce((sum, p) => sum + p.amount, 0);

    // User order payments
    const userOrderPayments = await Payment.find({ userOrderId: { $exists: true } });
    const userOrderTotal = userOrderPayments.reduce((sum, p) => sum + p.amount, 0);

    const totalReceived = salesTotal + invoiceTotal + userOrderTotal;

    // Compute totalReceivable and totalPending from Sales, Invoices, UserOrders
    const [salesDocs, invoicesDocs, userOrdersDocs] = await Promise.all([
      Sales.find(),
      Invoice.find().populate('dealer', 'dealerName'),
      UserOrder.find().populate('user', 'name'),
    ]);

    let totalReceivable = 0;
    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;

    salesDocs.forEach((s) => {
      totalReceivable += s.totalAmount || 0;
      if (s.paymentStatus === 'paid') paidCount++;
      else if (s.paymentStatus === 'partial') partialCount++;
      else pendingCount++;
    });

    invoicesDocs.forEach((inv) => {
      totalReceivable += inv.amount || 0;
      if (inv.paymentStatus === 'paid') paidCount++;
      else if (inv.paymentStatus === 'partial') partialCount++;
      else pendingCount++;
    });

    userOrdersDocs.forEach((ord) => {
      totalReceivable += ord.totalAmount || 0;
      if (ord.paymentStatus === 'paid') paidCount++;
      else if (ord.paymentStatus === 'partial') partialCount++;
      else pendingCount++;
    });

    const totalPending = totalReceivable - totalReceived;

    // Total payments by method
    const paymentsByMethod = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent payments
    const recentPayments = await Payment.find()
      .populate('saleId')
      .populate('invoiceId')
      .populate('userOrderId')
      .populate('receivedBy', 'name')
      .sort({ paymentDate: -1 })
      .limit(10);

    res.json({
      totalReceived,
      totalReceivable,
      totalPending,
      paidCount,
      partialCount,
      pendingCount,
      salesPayments: salesTotal,
      invoicePayments: invoiceTotal,
      userOrderPayments: userOrderTotal,
      paymentsByMethod,
      recentPayments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer ledger (including user orders)
// Returns { customer, amount, paid, balance, status, date } per entry
router.get('/ledger', auth, adminOnly, async (req, res) => {
  try {
    const ledgerMap = new Map(); // key: customer (+ source prefix for uniqueness), value: { customer, amount, paid, balance, status, date, saleId?, invoiceId?, sourceType }

    // Sales - group by customerName
    const sales = await Sales.find().sort({ updatedAt: -1 });
    sales.forEach((s) => {
      const customer = s.customerName;
      const amount = s.totalAmount || 0;
      const paid = s.paidAmount || 0;
      const balance = amount - paid;
      const status = s.paymentStatus || (balance <= 0 ? 'paid' : paid > 0 ? 'partial' : 'pending');
      const date = s.updatedAt || s.createdAt;
      const key = `sale:${customer}`;
      if (!ledgerMap.has(key)) {
        ledgerMap.set(key, {
          customer,
          amount: 0,
          paid: 0,
          balance: 0,
          status: 'pending',
          date,
          saleId: s._id,
          sourceType: 'sale',
        });
      }
      const entry = ledgerMap.get(key);
      entry.amount += amount;
      entry.paid += paid;
      entry.balance += balance;
      entry.status = balance <= 0 ? 'paid' : entry.paid > 0 ? 'partial' : 'pending';
      if (new Date(date) > new Date(entry.date)) entry.date = date;
    });

    // Invoices - group by dealer
    const invoices = await Invoice.find().populate('dealer', 'dealerName dealerId').sort({ updatedAt: -1 });
    invoices.forEach((inv) => {
      const customer = inv.dealer?.dealerName || inv.dealerId || 'Dealer';
      const amount = inv.amount || 0;
      const paid = inv.paidAmount || 0;
      const balance = amount - paid;
      const status = inv.paymentStatus || (balance <= 0 ? 'paid' : paid > 0 ? 'partial' : 'pending');
      const date = inv.updatedAt || inv.createdAt;
      const key = `invoice:${customer}`;
      if (!ledgerMap.has(key)) {
        ledgerMap.set(key, {
          customer,
          amount: 0,
          paid: 0,
          balance: 0,
          status: 'pending',
          date,
          invoiceId: balance > 0 ? inv._id : null,
          sourceType: 'invoice',
        });
      }
      const entry = ledgerMap.get(key);
      entry.amount += amount;
      entry.paid += paid;
      entry.balance += balance;
      entry.status = balance <= 0 ? 'paid' : entry.paid > 0 ? 'partial' : 'pending';
      if (balance > 0 && !entry.invoiceId) entry.invoiceId = inv._id;
      if (new Date(date) > new Date(entry.date)) entry.date = date;
    });

    // UserOrders - group by user
    const userOrders = await UserOrder.find().populate('user', 'name').sort({ updatedAt: -1 });
    userOrders.forEach((ord) => {
      const customer = ord.user?.name || 'User';
      const amount = ord.totalAmount || 0;
      const paid = ord.paymentStatus === 'paid' ? amount : 0;
      const balance = amount - paid;
      const status = ord.paymentStatus || (balance <= 0 ? 'paid' : 'pending');
      const date = ord.updatedAt || ord.createdAt;
      const key = `userOrder:${ord.user?._id || customer}`;
      if (!ledgerMap.has(key)) {
        ledgerMap.set(key, {
          customer,
          amount: 0,
          paid: 0,
          balance: 0,
          status: 'pending',
          date,
          sourceType: 'userOrder',
          userOrderId: ord._id,
        });
      }
      const entry = ledgerMap.get(key);
      entry.amount += amount;
      entry.paid += paid;
      entry.balance += balance;
      entry.status = balance <= 0 ? 'paid' : entry.paid > 0 ? 'partial' : 'pending';
      if (new Date(date) > new Date(entry.date)) entry.date = date;
    });

    // Convert to array and sort by date desc (most recent first)
    const ledger = Array.from(ledgerMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(ledger);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user order specific payments
router.get('/user-orders', auth, adminOnly, async (req, res) => {
  try {
    const payments = await Payment.find({ userOrderId: { $exists: true } })
      .populate('userOrderId')
      .populate('receivedBy', 'name email')
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete payment (and roll back balances)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.saleId) {
      const sale = await Sales.findById(payment.saleId);
      if (sale) {
        sale.paidAmount = Math.max(0, (sale.paidAmount || 0) - (payment.amount || 0));
        await sale.save();
      }
    }

    if (payment.invoiceId) {
      const invoice = await Invoice.findById(payment.invoiceId);
      if (invoice) {
        invoice.paidAmount = Math.max(0, (invoice.paidAmount || 0) - (payment.amount || 0));
        if (invoice.paidAmount >= invoice.amount) {
          invoice.paymentStatus = 'paid';
        } else if (invoice.paidAmount > 0) {
          invoice.paymentStatus = 'partial';
        } else {
          invoice.paymentStatus = 'pending';
        }
        await invoice.save();
      }
    }

    if (payment.userOrderId) {
      const order = await UserOrder.findById(payment.userOrderId);
      if (order) {
        order.paymentStatus = 'pending';
        await order.save();
      }
    }

    await payment.deleteOne();
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
