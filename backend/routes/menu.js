const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { protect, authorize } = require('../middleware/auth');

// GET /api/menu/:restaurantId
router.get('/:restaurantId', async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurant: req.params.restaurantId });
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    res.json({ items, grouped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/menu
router.post('/', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant && req.user.role !== 'admin') {
      return res.status(404).json({ message: 'No restaurant found for this owner' });
    }
    const restaurantId = req.body.restaurant || restaurant._id;
    const item = await MenuItem.create({ ...req.body, restaurant: restaurantId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/menu/:id
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/menu/:id
router.delete('/:id', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
