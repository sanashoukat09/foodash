const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['customer', 'restaurant_owner', 'driver', 'admin'], default: 'customer' },
  phone:      { type: String },
  address:    { type: String },
  avatar:     { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
  // Driver specific
  isAvailable:        { type: Boolean, default: false },
  currentLocation:    { type: String },
  totalDeliveries:    { type: Number, default: 0 },
  earnings:           { type: Number, default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
