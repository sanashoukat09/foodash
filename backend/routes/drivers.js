const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// GET /api/drivers/available-orders - orders ready for pickup
router.get('/available-orders', protect, authorize('driver'), async (req, res) => {
  try {
    const orders = await Order.find({ status: 'ready', driver: null })
      .populate('restaurant', 'name address phone image')
      .populate('customer', 'name phone address')
      .sort({ createdAt: 1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/drivers/toggle-availability
router.put('/toggle-availability', protect, authorize('driver'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isAvailable: !req.user.isAvailable },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/drivers/my-stats
router.get('/my-stats', protect, authorize('driver'), async (req, res) => {
  try {
    const totalDeliveries = await Order.countDocuments({ driver: req.user._id, status: 'delivered' });
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayDeliveries = await Order.countDocuments({ driver: req.user._id, status: 'delivered', updatedAt: { $gte: todayStart } });
    res.json({ totalDeliveries, todayDeliveries, earnings: req.user.earnings || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
