const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// POST /api/payments/create-intent
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { amount, orderId } = req.body; // amount in dollars
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: 'usd',
      metadata: { orderId: orderId?.toString(), userId: req.user._id.toString() },
    });
    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/confirm
router.post('/confirm', protect, async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: 'paid', paymentIntentId },
        { new: true }
      ).populate('restaurant', 'name image').populate('customer', 'name email');
      res.json({ success: true, order });
    } else {
      res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/refund
router.post('/refund', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order?.paymentIntentId) return res.status(400).json({ message: 'No payment to refund' });

    const refund = await stripe.refunds.create({ payment_intent: order.paymentIntentId });
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'refunded', status: 'cancelled' });

    res.json({ success: true, refund });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
