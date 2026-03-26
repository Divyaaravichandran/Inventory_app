const express = require('express');
const { body, validationResult } = require('express-validator');
const Dealer = require('../models/Dealer');
const DealerOrder = require('../models/DealerOrder');
const Invoice = require('../models/Invoice');
const Rice = require('../models/Rice');
const { auth, adminOnly, dealerOnly } = require('../middleware/auth');

const router = express.Router();

const BAG_WEIGHTS = {
  '5kg': 5,
  '10kg': 10,
  '25kg': 25,
  '75kg': 75,
};

// Dealer: place order
router.post(
  '/dealer',
  auth,
  dealerOnly,
  [
    body('riceType').notEmpty().withMessage('Rice type is required'),
    body('brand').notEmpty().withMessage('Brand is required'),
    body('bagSize')
      .isIn(['5kg', '10kg', '25kg', '75kg'])
      .withMessage('Invalid bag size'),
    body('quantityBags').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const dealer = await Dealer.findOne({
        dealerId: req.user.dealerId,
        status: 'active',
      });

      if (!dealer) {
        return res.status(400).json({ message: 'Dealer not found or inactive' });
      }

      const { riceType, brand, bagSize, quantityBags } = req.body;
      const weightPerBag = BAG_WEIGHTS[bagSize];
      const totalQuantityKg = weightPerBag * quantityBags;
      const ratePerKg = Number(req.body.ratePerKg || 0);
      const totalAmount = ratePerKg > 0 ? totalQuantityKg * ratePerKg : 0;

      const order = new DealerOrder({
        dealer: dealer._id,
        dealerId: dealer.dealerId,
        riceType,
        brand,
        bagSize,
        quantityBags,
        totalQuantityKg,
        ratePerKg,
        totalAmount,
        status: 'pending',
        createdByUser: req.user._id,
      });

      await order.save();

      res.status(201).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Dealer: my orders
router.get('/dealer', auth, dealerOnly, async (req, res) => {
  try {
    const orders = await DealerOrder.find({ dealerId: req.user.dealerId }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: get all orders
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const orders = await DealerOrder.find()
      .populate('dealer')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: approve order (with inventory check and deduction)
router.post('/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const order = await DealerOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be approved' });
    }

    const weightPerBag = BAG_WEIGHTS[order.bagSize];
    const totalKgNeeded = weightPerBag * order.quantityBags;

    // Find rice stock matching type and brand
    const riceStock = await Rice.findOne({
      riceType: order.riceType,
      riceName: order.brand,
      status: { $in: ['ready', 'in_production'] },
    });

    if (!riceStock) {
      return res.status(400).json({ message: 'No matching rice stock found' });
    }

    // Check bag and quantity availability
    const availableBags = riceStock.bagsStock[order.bagSize] || 0;
    const totalBagsTracked = Object.values(riceStock.bagsStock || {}).reduce(
      (sum, val) => sum + (Number(val) || 0),
      0
    );
    if (riceStock.quantity < totalKgNeeded) {
      return res
        .status(400)
        .json({ message: 'Insufficient quantity to approve this order' });
    }
    if (totalBagsTracked > 0 && availableBags < order.quantityBags) {
      return res
        .status(400)
        .json({ message: 'Insufficient bags to approve this order' });
    }

    // Deduct inventory (only bags if tracking is enabled)
    if (totalBagsTracked > 0) {
      riceStock.bagsStock[order.bagSize] -= order.quantityBags;
    }
    riceStock.quantity -= totalKgNeeded;
    await riceStock.save();

    // Update order status
    order.status = 'approved';
    order.approvedBy = req.user._id;
    order.approvedAt = new Date();
    await order.save();

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: update order status (dispatched / delivered / rejected)
router.post('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected', 'dispatched', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await DealerOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dealer analytics
router.get('/dealer/analytics', auth, dealerOnly, async (req, res) => {
  try {
    const dealerId = req.user.dealerId;

    const orders = await DealerOrder.find({
      dealerId,
      status: { $in: ['approved', 'dispatched', 'delivered'] },
    }).sort({ createdAt: -1 });

    const totalQuantity = orders.reduce(
      (sum, o) => sum + (o.totalQuantityKg || 0),
      0
    );
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    );

    // Most purchased rice type
    const typeCounts = {};
    orders.forEach((o) => {
      typeCounts[o.riceType] = (typeCounts[o.riceType] || 0) + o.totalQuantityKg;
    });
    const mostPurchasedRiceType =
      Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const lastOrderDate = orders[0]?.createdAt || null;

    res.json({
      totalQuantity,
      totalRevenue,
      mostPurchasedRiceType,
      lastOrderDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dealer: delete own pending order (no invoice created)
router.delete('/dealer/:id', auth, dealerOnly, async (req, res) => {
  try {
    const order = await DealerOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.dealerId !== req.user.dealerId) {
      return res.status(403).json({ message: 'Not allowed to delete this order' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be deleted' });
    }

    const existingInvoice = await Invoice.findOne({ order: order._id });
    if (existingInvoice) {
      return res.status(400).json({ message: 'Order already invoiced' });
    }

    await order.deleteOne();
    res.json({ message: 'Order deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: delete order (restock if needed)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const order = await DealerOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Restock if inventory was already deducted
    if (['approved', 'dispatched', 'delivered'].includes(order.status)) {
      const weightPerBag = BAG_WEIGHTS[order.bagSize];
      const totalKgNeeded = weightPerBag * order.quantityBags;
      const riceStock = await Rice.findOne({
        riceType: order.riceType,
        riceName: order.brand,
        status: { $in: ['ready', 'in_production'] },
      });
      if (riceStock) {
        const totalBagsTracked = Object.values(riceStock.bagsStock || {}).reduce(
          (sum, val) => sum + (Number(val) || 0),
          0
        );
        if (totalBagsTracked > 0) {
          riceStock.bagsStock[order.bagSize] =
            (riceStock.bagsStock[order.bagSize] || 0) + order.quantityBags;
        }
        riceStock.quantity += totalKgNeeded;
        await riceStock.save();
      }
    }

    await order.deleteOne();
    res.json({ message: 'Order deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

