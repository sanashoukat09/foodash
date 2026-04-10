const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const { protect, authorize } = require('../middleware/auth');

// POST /api/reviews
router.post('/', protect, authorize('customer'), async (req, res) => {
  try {
    const { restaurantId, orderId, rating, comment, foodRating, deliveryRating } = req.body;
    const existing = await Review.findOne({ order: orderId });
    if (existing) return res.status(400).json({ message: 'Review already submitted for this order' });

    const review = await Review.create({
      customer: req.user._id,
      restaurant: restaurantId,
      order: orderId,
      rating, comment, foodRating, deliveryRating
    });

    // Update restaurant rating
    const reviews = await Review.find({ restaurant: restaurantId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: parseFloat(avgRating.toFixed(1)),
      totalRatings: reviews.length
    });

    const populated = await Review.findById(review._id).populate('customer', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/:restaurantId
router.get('/:restaurantId', async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
