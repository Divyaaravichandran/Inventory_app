const express = require('express');
const { body, validationResult } = require('express-validator');
const Godown = require('../models/Godown');
const Paddy = require('../models/Paddy');
const Rice = require('../models/Rice');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all godowns
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const godowns = await Godown.find().sort({ name: 1 });
    res.json(godowns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create godown
router.post('/', [
  auth,
  adminOnly,
  body('name').notEmpty().withMessage('Godown name is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('capacity').isNumeric().withMessage('Capacity must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const godown = new Godown(req.body);
    await godown.save();
    res.status(201).json(godown);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Godown name already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update godown
router.put('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const godown = await Godown.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!godown) {
      return res.status(404).json({ message: 'Godown not found' });
    }

    res.json(godown);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get godown details with stock
router.get('/:id/details', auth, adminOnly, async (req, res) => {
  try {
    const godown = await Godown.findById(req.params.id);
    if (!godown) {
      return res.status(404).json({ message: 'Godown not found' });
    }

    const paddyStock = await Paddy.find({ godownId: req.params.id });
    const riceStock = await Rice.find({ godownId: req.params.id });

    res.json({
      godown,
      paddyStock,
      riceStock
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete godown (only if no stock)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const godown = await Godown.findById(req.params.id);
    if (!godown) {
      return res.status(404).json({ message: 'Godown not found' });
    }

    const [paddyCount, riceCount] = await Promise.all([
      Paddy.countDocuments({ godownId: req.params.id }),
      Rice.countDocuments({ godownId: req.params.id }),
    ]);

    if (paddyCount > 0 || riceCount > 0) {
      return res.status(400).json({ message: 'Cannot delete godown with stock entries' });
    }

    await godown.deleteOne();
    res.json({ message: 'Godown deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
