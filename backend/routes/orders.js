const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { protect, authorize } = require('../middleware/auth');

// POST /api/orders - place order
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, specialInstructions } = req.body;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = restaurant.deliveryFee || 2.99;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurantId,
      items,
      deliveryAddress,
      specialInstructions,
      subtotal: parseFloat(subtotal.toFixed(2)),
      deliveryFee,
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000),
    });

    await Restaurant.findByIdAndUpdate(restaurantId, { $inc: { totalOrders: 1 } });

    const populated = await Order.findById(order._id)
      .populate('restaurant', 'name image phone address')
      .populate('customer', 'name email phone');

    // Emit to restaurant owner room
    const io = req.app.get('io');
    io.to(`restaurant_${restaurantId}`).emit('new_order', populated);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders - get orders (role-based)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    const { status, page = 1, limit = 10 } = req.query;
    if (status) query.status = status;

    if (req.user.role === 'customer') query.customer = req.user._id;
    else if (req.user.role === 'driver') query.driver = req.user._id;
    else if (req.user.role === 'restaurant_owner') {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      if (restaurant) query.restaurant = restaurant._id;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('restaurant', 'name image phone')
      .populate('customer', 'name phone')
      .populate('driver', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name image phone address')
      .populate('customer', 'name email phone')
      .populate('driver', 'name phone currentLocation');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status - update order status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || '' });
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      await Restaurant.findByIdAndUpdate(order.restaurant, {
        $inc: { totalRevenue: order.total }
      });
    }
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('restaurant', 'name image phone')
      .populate('customer', 'name phone')
      .populate('driver', 'name phone');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`order_${order._id}`).emit('order_updated', populated);
    io.to(`customer_${order.customer}`).emit('order_updated', populated);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/assign-driver
router.put('/:id/assign-driver', protect, authorize('admin', 'driver'), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { driver: req.user._id, status: 'picked_up', $push: { statusHistory: { status: 'picked_up', note: 'Driver assigned' } } },
      { new: true }
    ).populate('restaurant', 'name').populate('customer', 'name phone');

    const io = req.app.get('io');
    io.to(`order_${order._id}`).emit('order_updated', order);
    io.to(`customer_${order.customer._id}`).emit('order_updated', order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
