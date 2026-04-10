const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

// GET /api/restaurants - list approved restaurants
router.get('/', async (req, res) => {
  try {
    const { cuisine, search, page = 1, limit = 12 } = req.query;
    const query = { isApproved: true };
    if (cuisine) query.cuisine = cuisine;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query)
      .populate('owner', 'name email phone')
      .sort({ rating: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ restaurants, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/restaurants/:id
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email phone');
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const menuItems = await MenuItem.find({ restaurant: req.params.id, isAvailable: true });
    const reviews = await Review.find({ restaurant: req.params.id })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    // Group menu by category
    const menu = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({ restaurant, menu, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/restaurants - create restaurant
router.post('/', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const existing = await Restaurant.findOne({ owner: req.user._id });
    if (existing && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'You already have a restaurant registered' });
    }
    const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id });
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/restaurants/:id
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/restaurants/owner/me
router.get('/owner/me', protect, authorize('restaurant_owner'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
