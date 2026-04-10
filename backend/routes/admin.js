const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

const adminOnly = [protect, authorize('admin')];

// GET /api/admin/stats
router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalRestaurants, totalOrders, revenueAgg] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }])
    ]);

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
    const pendingRestaurants = await Restaurant.countDocuments({ isApproved: false });

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalUsers, totalRestaurants, totalOrders, todayOrders, pendingRestaurants,
      totalRevenue: revenueAgg[0]?.total || 0,
      monthlyRevenue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', ...adminOnly, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/restaurants
router.get('/restaurants', ...adminOnly, async (req, res) => {
  try {
    const { approved, page = 1, limit = 20 } = req.query;
    const query = {};
    if (approved !== undefined) query.isApproved = approved === 'true';
    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query).populate('owner', 'name email phone').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ restaurants, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/restaurants/:id/approve
router.put('/restaurants/:id/approve', ...adminOnly, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/orders
router.get('/orders', ...adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('restaurant', 'name')
      .populate('customer', 'name email phone')
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(Number(limit));
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/create-admin
router.post('/create-admin', ...adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
