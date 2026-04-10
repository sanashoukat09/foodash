const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:         { type: String, required: true, trim: true },
  description:  { type: String },
  cuisine:      { type: String, required: true },
  address:      { type: String, required: true },
  phone:        { type: String },
  image:        { type: String, default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' },
  coverImage:   { type: String, default: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200' },
  isOpen:       { type: Boolean, default: true },
  isApproved:   { type: Boolean, default: false },
  deliveryTime: { type: String, default: '30-45 min' },
  deliveryFee:  { type: Number, default: 2.99 },
  minOrder:     { type: Number, default: 10 },
  rating:       { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalOrders:  { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  tags:         [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
