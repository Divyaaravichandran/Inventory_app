// backend/routes/userOrders.js (full route file with unchanged logic except for relying on auto-generated orderNumber)
const express = require('express');
const { body, validationResult } = require('express-validator');
const UserOrder = require('../models/UserOrder');
const Rice = require('../models/Rice');
const { auth, adminOnly, userOnly } = require('../middleware/auth');

const router = express.Router();

// Get available rice products for users
router.get('/products', async (req, res) => {
  try {
    const rice = await Rice.find({
      status: { $in: ['ready', 'in_production'] },
      quantity: { $gt: 0 },
    })
      .populate('godownId', 'name location')
      .sort({ createdAt: -1 });

    // Transform data for user display
    const products = rice.map((item) => ({
      _id: item._id,
      riceType: item.riceType,
      riceName: item.riceName,
      brand: item.riceName,
      availableQuantity: item.quantity,
      bagsStock: item.bagsStock,
      godown: item.godownId,
      ratePerKg: item.ratePerKg || 0,
      inStock: item.quantity > 0,
    }));

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Place user order
router.post(
  '/order',
  [
    auth,
    userOnly,
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.riceType').notEmpty().withMessage('Rice type is required'),
    body('items.*.brand').notEmpty().withMessage('Brand is required'),
    body('items.*.bagSize').isIn(['5kg', '10kg', '25kg', '75kg']).withMessage('Invalid bag size'),
    body('items.*.quantityBags').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    body('contactPhone').notEmpty().withMessage('Contact phone is required'),
    body('paymentMethod').isIn(['cash_on_delivery', 'online', 'bank_transfer']).withMessage('Invalid payment method'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { items, shippingAddress, contactPhone, paymentMethod, notes } = req.body;

      // Validate stock availability for each item
      const BAG_WEIGHTS = { '5kg': 5, '10kg': 10, '25kg': 25, '75kg': 75 };
      let totalAmount = 0;

      for (const item of items) {
        const weightPerBag = BAG_WEIGHTS[item.bagSize];
        const totalKgNeeded = weightPerBag * item.quantityBags;

        // Find rice stock
        const riceStock = await Rice.findOne({
          riceType: item.riceType,
          riceName: item.brand,
          status: { $in: ['ready', 'in_production'] },
        });

        if (!riceStock) {
          return res
            .status(400)
            .json({ message: `No matching rice stock found for ${item.riceType} - ${item.brand}` });
        }

        // Check availability
        const availableBags = riceStock.bagsStock[item.bagSize] || 0;
        if (availableBags < item.quantityBags || riceStock.quantity < totalKgNeeded) {
          return res
            .status(400)
            .json({ message: `Insufficient stock for ${item.riceType} - ${item.brand}` });
        }

        // Calculate item total (rate must be set by admin)
        const ratePerKg = riceStock.ratePerKg || 0;
        if (ratePerKg <= 0) {
          return res
            .status(400)
            .json({ message: `Price not set for ${item.riceType} - ${item.brand}` });
        }
        item.weightPerBag = weightPerBag;
        item.totalQuantityKg = totalKgNeeded;
        item.ratePerKg = ratePerKg;
        item.totalAmount = totalKgNeeded * ratePerKg;
        totalAmount += item.totalAmount;
      }

      // Create order (orderNumber is auto-generated in the model)
      const order = new UserOrder({
        user: req.user._id,
        items,
        totalAmount,
        shippingAddress,
        contactPhone,
        paymentMethod,
        notes,
        orderType: 'online',
      });

      await order.save();

      // Deduct inventory immediately on checkout
      for (const item of items) {
        const riceStock = await Rice.findOne({
          riceType: item.riceType,
          riceName: item.brand,
          status: { $in: ['ready', 'in_production'] },
        });

        if (!riceStock) continue;

        riceStock.quantity = Math.max(0, (riceStock.quantity || 0) - (item.totalQuantityKg || 0));
        if (riceStock.bagsStock && item.bagSize) {
          riceStock.bagsStock[item.bagSize] = Math.max(
            0,
            (riceStock.bagsStock[item.bagSize] || 0) - (item.quantityBags || 0)
          );
        }

        await riceStock.save();
      }

      // TODO: Send order confirmation email/SMS
      // TODO: Send notification to admin

      res.status(201).json({
        message: 'Order placed successfully',
        order,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get user's orders
router.get('/orders', auth, userOnly, async (req, res) => {
  try {
    const orders = await UserOrder.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific order details
router.get('/orders/:id', auth, userOnly, async (req, res) => {
  try {
    const order = await UserOrder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel user order (only if pending)
router.put('/orders/:id/cancel', auth, userOnly, async (req, res) => {
  try {
    const order = await UserOrder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending orders' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user order (only if pending or cancelled)
router.delete('/orders/:id', auth, userOnly, async (req, res) => {
  try {
    const order = await UserOrder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!['pending', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'Only pending or cancelled orders can be deleted' });
    }

    await order.deleteOne();
    res.json({ message: 'Order deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all user orders
router.get('/admin/orders', auth, adminOnly, async (req, res) => {
  try {
    const { status, paymentStatus, orderType } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (orderType) filter.orderType = orderType;

    const orders = await UserOrder.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update order status
router.put('/admin/orders/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await UserOrder.findByIdAndUpdate(
      req.params.id,
      {
        status,
        trackingNumber: trackingNumber || undefined,
        processedAt: status === 'confirmed' ? new Date() : undefined,
        shippedAt: status === 'shipped' ? new Date() : undefined,
        deliveredAt: status === 'delivered' ? new Date() : undefined,
        approvedBy: req.user._id,
      },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update payment status
router.put('/admin/orders/:id/payment', auth, adminOnly, async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!['pending', 'paid', 'partial', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await UserOrder.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete user order
router.delete('/admin/orders/:id', auth, adminOnly, async (req, res) => {
  try {
    const order = await UserOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    await order.deleteOne();
    res.json({ message: 'Order deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
