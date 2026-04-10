const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem:   { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name:       { type: String, required: true },
  price:      { type: Number, required: true },
  quantity:   { type: Number, required: true },
  image:      { type: String },
});

const orderSchema = new mongoose.Schema({
  customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant:   { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  driver:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items:        [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status:     String,
    time:       { type: Date, default: Date.now },
    note:       String,
  }],
  deliveryAddress:  { type: String, required: true },
  subtotal:         { type: Number, required: true },
  deliveryFee:      { type: Number, required: true },
  tax:              { type: Number, required: true },
  total:            { type: Number, required: true },
  paymentStatus:    { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentIntentId:  { type: String },
  specialInstructions: { type: String },
  estimatedDelivery:   { type: Date },
  deliveredAt:         { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
