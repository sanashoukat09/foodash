const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant:   { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name:         { type: String, required: true },
  description:  { type: String },
  price:        { type: Number, required: true },
  category:     { type: String, required: true },
  image:        { type: String, default: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
  isAvailable:  { type: Boolean, default: true },
  isVeg:        { type: Boolean, default: false },
  spiceLevel:   { type: String, enum: ['mild', 'medium', 'hot', 'extra-hot'], default: 'mild' },
  calories:     { type: Number },
  preparationTime: { type: Number, default: 15 },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
