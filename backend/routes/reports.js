const express = require('express');
const Paddy = require('../models/Paddy');
const Rice = require('../models/Rice');
const Sales = require('../models/Sales');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    // Paddy stock
    const paddyStock = await Paddy.aggregate([
      { $group: { _id: null, total: { $sum: '$weight' } } }
    ]);

    // Rice in production
    const riceInProduction = await Rice.aggregate([
      { $match: { status: 'in_production' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    // Rice stock
    const riceStock = await Rice.aggregate([
      { $match: { status: 'ready' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    // Bag stock
    const bagStock = await Rice.aggregate([
      {
        $group: {
          _id: null,
          '5kg': { $sum: '$bagsStock.5kg' },
          '10kg': { $sum: '$bagsStock.10kg' },
          '25kg': { $sum: '$bagsStock.25kg' },
          '75kg': { $sum: '$bagsStock.75kg' }
        }
      }
    ]);

    // Husk, broken rice, waste (mock data - you can add models for these)
    const huskStock = 0;
    const brokenRiceStock = 0;
    const wasteRiceStock = 0;

    // Payment summary
    const sales = await Sales.find();
    const totalReceivable = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalReceived = sales.reduce((sum, s) => sum + s.paidAmount, 0);
    const totalPending = totalReceivable - totalReceived;

    // Profit/Loss summary (based on paddy purchase cost vs sales revenue)
    const [paddyCostAgg, salesRevenueAgg] = await Promise.all([
      Paddy.aggregate([{ $group: { _id: null, totalCost: { $sum: '$purchaseAmount' } } }]),
      Sales.aggregate([
        { $match: { paddyId: { $exists: true, $ne: null } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ])
    ]);

    const totalPurchaseCost = paddyCostAgg[0]?.totalCost || 0;
    const totalSalesRevenue = salesRevenueAgg[0]?.totalRevenue || 0;
    const profitLoss = totalSalesRevenue - totalPurchaseCost;

    res.json({
      kpis: {
        paddyStock: paddyStock[0]?.total || 0,
        riceInProduction: riceInProduction[0]?.total || 0,
        riceStock: riceStock[0]?.total || 0,
        bagsStock: bagStock[0] || { '5kg': 0, '10kg': 0, '25kg': 0, '75kg': 0 },
        huskStock,
        brokenRiceStock,
        wasteRiceStock
      },
      payments: {
        totalReceivable,
        totalReceived,
        totalPending,
        paidPercent: totalReceivable > 0 ? (totalReceived / totalReceivable) * 100 : 0
      },
      profitLoss: {
        totalPurchaseCost,
        totalSalesRevenue,
        profitLoss
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chart data (daily/weekly/monthly)
router.get('/charts', auth, adminOnly, async (req, res) => {
  try {
    const period = req.query.period || 'daily'; // daily, weekly, monthly
    const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Paddy inward
    const paddyInward = await Paddy.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$weight' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Rice produced
    const riceProduced = await Rice.aggregate([
      { $match: { productionDate: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$productionDate' } },
          total: { $sum: '$quantity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Rice sold
    const riceSold = await Sales.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$quantity' },
          amount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      paddyInward,
      riceProduced,
      riceSold
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
