const mongoose = require('mongoose');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  // Clear existing data
  await User.deleteMany({});
  await Restaurant.deleteMany({});
  await MenuItem.deleteMany({});
  console.log('🗑️  Cleared old data');

  // ─── USERS ───────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@foodash.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0001',
  });

  const owner1 = await User.create({
    name: 'Mario Rossi',
    email: 'mario@foodash.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '+1-555-0002',
  });

  const owner2 = await User.create({
    name: 'Chen Wei',
    email: 'chen@foodash.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '+1-555-0003',
  });

  const owner3 = await User.create({
    name: 'Ahmed Khan',
    email: 'ahmed@foodash.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '+1-555-0004',
  });

  const owner4 = await User.create({
    name: 'Sakura Tanaka',
    email: 'sakura@foodash.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '+1-555-0005',
  });

  const owner5 = await User.create({
    name: 'Carlos Mendez',
    email: 'carlos@foodash.com',
    password: 'password123',
    role: 'restaurant_owner',
    phone: '+1-555-0006',
  });

  const customer = await User.create({
    name: 'John Customer',
    email: 'customer@foodash.com',
    password: 'password123',
    role: 'customer',
    phone: '+1-555-0010',
    address: '123 Main Street, New York, NY',
  });

  const driver = await User.create({
    name: 'Dave Driver',
    email: 'driver@foodash.com',
    password: 'password123',
    role: 'driver',
    phone: '+1-555-0020',
    isAvailable: true,
  });

  console.log('👥 Users created');

  // ─── RESTAURANTS ─────────────────────────────────────────
  const r1 = await Restaurant.create({
    owner: owner1._id,
    name: "Mario's Pizza Palace",
    description: 'Authentic Neapolitan pizza baked in a wood-fired oven since 1985. Fresh ingredients, secret family recipes.',
    cuisine: 'Pizza',
    address: '42 Napoli Street, New York, NY 10001',
    phone: '+1-555-1001',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop',
    isOpen: true,
    isApproved: true,
    deliveryTime: '25-35 min',
    deliveryFee: 1.99,
    minOrder: 12,
    rating: 4.8,
    totalRatings: 324,
    totalOrders: 1250,
    tags: ['Wood Fired', 'Italian', 'Family Friendly'],
  });

  const r2 = await Restaurant.create({
    owner: owner1._id,
    name: 'Burger Republic',
    description: 'Smash burgers, crispy fries and thick milkshakes. The best burger joint in town, period.',
    cuisine: 'Burgers',
    address: '88 Liberty Ave, Brooklyn, NY 11208',
    phone: '+1-555-1002',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=400&fit=crop',
    isOpen: true,
    isApproved: true,
    deliveryTime: '20-30 min',
    deliveryFee: 2.49,
    minOrder: 10,
    rating: 4.6,
    totalRatings: 198,
    totalOrders: 890,
    tags: ['Smash Burgers', 'American', 'Best Seller'],
  });

  const r3 = await Restaurant.create({
    owner: owner2._id,
    name: 'Dragon Palace',
    description: 'Authentic Chinese cuisine — dim sum, Peking duck, hand-pulled noodles. Taste of Beijing in every bite.',
    cuisine: 'Chinese',
    address: '15 Dragon Street, Chinatown, NY 10013',
    phone: '+1-555-1003',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=1200&h=400&fit=crop',
    isOpen: true,
    isApproved: true,
    deliveryTime: '30-45 min',
    deliveryFee: 2.99,
    minOrder: 15,
    rating: 4.5,
    totalRatings: 156,
    totalOrders: 670,
    tags: ['Dim Sum', 'Noodles', 'Authentic'],
  });

  const r4 = await Restaurant.create({
    owner: owner3._id,
    name: 'Spice Garden',
    description: 'Award-winning Indian restaurant. Rich curries, tandoor specialties and freshly baked naan every day.',
    cuisine: 'Indian',
    address: '7 Curry Lane, Queens, NY 11372',
    phone: '+1-555-1004',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&h=400&fit=crop',
    isOpen: true,
    isApproved: true,
    deliveryTime: '35-50 min',
    deliveryFee: 2.49,
    minOrder: 15,
    rating: 4.7,
    totalRatings: 287,
    totalOrders: 1100,
    tags: ['Curry', 'Tandoor', 'Vegetarian Options'],
  });

  const r5 = await Restaurant.create({
    owner: owner4._id,
    name: 'Sakura Sushi',
    description: 'Premium Japanese sushi and sashimi. Fresh fish flown in daily. Traditional omakase experience.',
    cuisine: 'Sushi',
    address: '33 Sakura Blvd, Manhattan, NY 10036',
    phone: '+1-555-1005',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=1200&h=400&fit=crop',
    isOpen: true,
    isApproved: true,
    deliveryTime: '30-40 min',
    deliveryFee: 3.99,
    minOrder: 20,
    rating: 4.9,
    totalRatings: 412,
    totalOrders: 1580,
    tags: ['Premium', 'Fresh Fish', 'Japanese'],
  });

  const r6 = await Restaurant.create({
    owner: owner5._id,
    name: 'Taco Fiesta',
    description: 'Street-style Mexican tacos, burritos and quesadillas. Bold flavors, fresh salsas, festive vibes.',
    cuisine: 'Mexican',
    address: '22 Fiesta Road, Bronx, NY 10451',
    phone: '+1-555-1006',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=1200&h=400&fit=crop',
    isOpen: true,
    isApproved: true,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    minOrder: 10,
    rating: 4.4,
    totalRatings: 143,
    totalOrders: 560,
    tags: ['Street Food', 'Spicy', 'Mexican'],
  });

  const r7 = await Restaurant.create({
    owner: owner2._id,
    name: 'Thai Orchid',
    description: 'Authentic Thai food — pad thai, green curry, mango sticky rice. A culinary journey to Bangkok.',
    cuisine: 'Thai',
    address: '9 Orchid Street, Manhattan, NY 10019',
    phone: '+1-555-1007',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=1200&h=400&fit=crop',
    isOpen: true,
    isApproved: true,
    deliveryTime: '30-45 min',
    deliveryFee: 2.99,
    minOrder: 15,
    rating: 4.6,
    totalRatings: 189,
    totalOrders: 720,
    tags: ['Pad Thai', 'Curry', 'Asian'],
  });

  const r8 = await Restaurant.create({
    owner: owner5._id,
    name: 'Sweet Tooth Desserts',
    description: 'Indulgent cakes, waffles, crepes and ice cream. Life is short — eat dessert first!',
    cuisine: 'Desserts',
    address: '5 Sugar Lane, Manhattan, NY 10022',
    phone: '+1-555-1008',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&h=400&fit=crop',
    isOpen: true,
    isApproved: true,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    minOrder: 8,
    rating: 4.7,
    totalRatings: 231,
    totalOrders: 890,
    tags: ['Cakes', 'Waffles', 'Ice Cream'],
  });

  console.log('🍕 Restaurants created');

  // ─── MENU ITEMS ──────────────────────────────────────────

  // Mario's Pizza Palace
  await MenuItem.insertMany([
    { restaurant: r1._id, name: 'Margherita Pizza', description: 'San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil', price: 14.99, category: 'Classic Pizzas', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 820 },
    { restaurant: r1._id, name: 'Pepperoni Pizza', description: 'Loaded with premium pepperoni, mozzarella, and house tomato sauce', price: 17.99, category: 'Classic Pizzas', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'mild', calories: 980 },
    { restaurant: r1._id, name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce, grilled chicken, red onions, cheddar & mozzarella', price: 18.99, category: 'Classic Pizzas', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'mild', calories: 1050 },
    { restaurant: r1._id, name: 'Veggie Supreme', description: 'Bell peppers, mushrooms, olives, onions, cherry tomatoes, pesto base', price: 16.99, category: 'Classic Pizzas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 750 },
    { restaurant: r1._id, name: 'Garlic Bread', description: 'Toasted ciabatta with garlic butter, herbs and parmesan', price: 5.99, category: 'Sides', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 320 },
    { restaurant: r1._id, name: 'Caesar Salad', description: 'Romaine lettuce, croutons, parmesan, house Caesar dressing', price: 8.99, category: 'Sides', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 280 },
    { restaurant: r1._id, name: 'Tiramisu', description: 'Classic Italian tiramisu with mascarpone and espresso-soaked ladyfingers', price: 6.99, category: 'Desserts', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 380 },
    { restaurant: r1._id, name: 'Coke / Diet Coke', description: 'Ice cold 330ml can', price: 2.49, category: 'Drinks', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 140 },
  ]);

  // Burger Republic
  await MenuItem.insertMany([
    { restaurant: r2._id, name: 'Classic Smash Burger', description: 'Double smash patty, American cheese, pickles, onions, secret sauce', price: 12.99, category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'mild', calories: 750 },
    { restaurant: r2._id, name: 'Bacon BBQ Burger', description: 'Crispy bacon, cheddar, caramelized onions, BBQ sauce, brioche bun', price: 14.99, category: 'Burgers', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'mild', calories: 920 },
    { restaurant: r2._id, name: 'Spicy Jalapeño Burger', description: 'Beef patty, pepper jack cheese, fresh jalapeños, chipotle mayo', price: 13.99, category: 'Burgers', image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'hot', calories: 830 },
    { restaurant: r2._id, name: 'Veggie Mushroom Burger', description: 'Portobello mushroom patty, swiss cheese, arugula, truffle mayo', price: 11.99, category: 'Burgers', image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 620 },
    { restaurant: r2._id, name: 'Loaded Cheese Fries', description: 'Crispy fries topped with cheddar sauce, bacon bits and chives', price: 7.99, category: 'Sides', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'mild', calories: 680 },
    { restaurant: r2._id, name: 'Onion Rings', description: 'Golden beer-battered onion rings with dipping sauce', price: 5.99, category: 'Sides', image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 450 },
    { restaurant: r2._id, name: 'Chocolate Milkshake', description: 'Thick & creamy shake blended with premium chocolate ice cream', price: 6.49, category: 'Drinks', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 580 },
  ]);

  // Dragon Palace - Chinese
  await MenuItem.insertMany([
    { restaurant: r3._id, name: 'Kung Pao Chicken', description: 'Wok-tossed chicken with peanuts, dried chilies, Sichuan peppercorns', price: 14.99, category: 'Main Course', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'hot', calories: 620 },
    { restaurant: r3._id, name: 'Dim Sum Basket (6 pcs)', description: 'Assorted steamed dumplings — pork, shrimp and vegetable', price: 11.99, category: 'Dim Sum', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'mild', calories: 380 },
    { restaurant: r3._id, name: 'Beef Chow Mein', description: 'Stir-fried noodles with tender beef strips, bean sprouts, spring onions', price: 13.99, category: 'Noodles', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'mild', calories: 720 },
    { restaurant: r3._id, name: 'Vegetable Fried Rice', description: 'Wok-fried jasmine rice with seasonal vegetables, eggs, soy sauce', price: 10.99, category: 'Rice', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 480 },
    { restaurant: r3._id, name: 'Sweet & Sour Pork', description: 'Crispy pork in tangy sweet and sour sauce with pineapple and peppers', price: 15.99, category: 'Main Course', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'mild', calories: 780 },
    { restaurant: r3._id, name: 'Spring Rolls (4 pcs)', description: 'Crispy golden rolls stuffed with vegetables and vermicelli', price: 7.99, category: 'Starters', image: 'https://images.unsplash.com/photo-1548506398-c1e99af95fe2?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 290 },
  ]);

  // Spice Garden - Indian
  await MenuItem.insertMany([
    { restaurant: r4._id, name: 'Butter Chicken', description: 'Tender chicken in rich, creamy tomato-butter sauce. A timeless classic.', price: 16.99, category: 'Curries', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'medium', calories: 680 },
    { restaurant: r4._id, name: 'Paneer Tikka Masala', description: 'Grilled cottage cheese cubes in spiced tomato-cream gravy', price: 15.99, category: 'Curries', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'medium', calories: 590 },
    { restaurant: r4._id, name: 'Lamb Biryani', description: 'Slow-cooked fragrant basmati rice with tender lamb, saffron and whole spices', price: 18.99, category: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'medium', calories: 820 },
    { restaurant: r4._id, name: 'Garlic Naan (2 pcs)', description: 'Tandoor-baked flatbread brushed with garlic butter and cilantro', price: 4.99, category: 'Breads', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 280 },
    { restaurant: r4._id, name: 'Dal Makhani', description: 'Slow-cooked black lentils in buttery tomato sauce, overnight preparation', price: 12.99, category: 'Curries', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 420 },
    { restaurant: r4._id, name: 'Chicken Tikka (6 pcs)', description: 'Marinated chicken chunks grilled in tandoor, served with mint chutney', price: 13.99, category: 'Starters', image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'medium', calories: 380 },
    { restaurant: r4._id, name: 'Mango Lassi', description: 'Chilled yogurt drink blended with fresh Alphonso mango pulp', price: 4.49, category: 'Drinks', image: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 220 },
  ]);

  // Sakura Sushi
  await MenuItem.insertMany([
    { restaurant: r5._id, name: 'Salmon Nigiri (2 pcs)', description: 'Premium Atlantic salmon over hand-pressed seasoned sushi rice', price: 8.99, category: 'Nigiri', image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'mild', calories: 160 },
    { restaurant: r5._id, name: 'Dragon Roll (8 pcs)', description: 'Shrimp tempura inside, avocado on top, eel sauce drizzle', price: 16.99, category: 'Specialty Rolls', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'mild', calories: 480 },
    { restaurant: r5._id, name: 'Spicy Tuna Roll (8 pcs)', description: 'Fresh tuna, sriracha mayo, cucumber, sesame seeds', price: 14.99, category: 'Maki Rolls', image: 'https://images.unsplash.com/photo-1617196034086-8b82c34a2616?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'hot', calories: 360 },
    { restaurant: r5._id, name: 'Veggie Avocado Roll (8 pcs)', description: 'Creamy avocado, cucumber, pickled radish, sesame', price: 11.99, category: 'Maki Rolls', image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 280 },
    { restaurant: r5._id, name: 'Edamame', description: 'Steamed salted soybean pods, lightly seasoned', price: 5.99, category: 'Starters', image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 120 },
    { restaurant: r5._id, name: 'Miso Soup', description: 'Traditional dashi broth with tofu, wakame seaweed and green onions', price: 3.99, category: 'Starters', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 80 },
    { restaurant: r5._id, name: 'Green Tea Ice Cream', description: 'Creamy matcha ice cream with red bean topping', price: 6.99, category: 'Desserts', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 240 },
  ]);

  // Taco Fiesta
  await MenuItem.insertMany([
    { restaurant: r6._id, name: 'Carne Asada Tacos (3 pcs)', description: 'Grilled seasoned beef, pico de gallo, guacamole, corn tortillas', price: 12.99, category: 'Tacos', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'medium', calories: 520 },
    { restaurant: r6._id, name: 'Chicken Burrito', description: 'Flour tortilla stuffed with grilled chicken, rice, beans, cheese, sour cream', price: 11.99, category: 'Burritos', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'medium', calories: 780 },
    { restaurant: r6._id, name: 'Veggie Quesadilla', description: 'Grilled flour tortilla with roasted peppers, mushrooms, three-cheese blend', price: 9.99, category: 'Quesadillas', image: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 560 },
    { restaurant: r6._id, name: 'Nachos Grande', description: 'Tortilla chips piled with cheese sauce, jalapeños, sour cream, guacamole', price: 10.99, category: 'Sides', image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'hot', calories: 720 },
    { restaurant: r6._id, name: 'Churros (4 pcs)', description: 'Crispy fried dough sticks dusted with cinnamon sugar, chocolate dip', price: 5.99, category: 'Desserts', image: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 340 },
    { restaurant: r6._id, name: 'Horchata', description: 'Traditional Mexican rice milk drink with cinnamon and vanilla', price: 3.99, category: 'Drinks', image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 180 },
  ]);

  // Thai Orchid
  await MenuItem.insertMany([
    { restaurant: r7._id, name: 'Pad Thai', description: 'Rice noodles stir-fried with shrimp, tofu, bean sprouts, crushed peanuts', price: 14.99, category: 'Noodles', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'medium', calories: 680 },
    { restaurant: r7._id, name: 'Green Curry', description: 'Coconut milk green curry with chicken, Thai eggplant, bamboo shoots, basil', price: 15.99, category: 'Curries', image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'hot', calories: 590 },
    { restaurant: r7._id, name: 'Tom Yum Soup', description: 'Spicy-sour lemongrass broth with mushrooms, shrimp and kaffir lime', price: 11.99, category: 'Soups', image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'hot', calories: 220 },
    { restaurant: r7._id, name: 'Mango Sticky Rice', description: 'Sweet glutinous rice with fresh mango slices and coconut cream', price: 7.99, category: 'Desserts', image: 'https://images.unsplash.com/photo-1561677978-583a908be4c9?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 420 },
    { restaurant: r7._id, name: 'Spring Rolls (4 pcs)', description: 'Fresh rice paper rolls with shrimp, vermicelli, herbs, peanut sauce', price: 8.99, category: 'Starters', image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&h=400&fit=crop', isVeg: false, spiceLevel: 'mild', calories: 280 },
    { restaurant: r7._id, name: 'Thai Iced Tea', description: 'Strong-brewed Thai tea with sweetened condensed milk over ice', price: 4.49, category: 'Drinks', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 260 },
  ]);

  // Sweet Tooth Desserts
  await MenuItem.insertMany([
    { restaurant: r8._id, name: 'Belgian Waffles', description: 'Fluffy golden waffles with fresh strawberries, whipped cream and maple syrup', price: 10.99, category: 'Waffles', image: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 620 },
    { restaurant: r8._id, name: 'Chocolate Lava Cake', description: 'Warm dark chocolate cake with gooey molten center, vanilla ice cream', price: 8.99, category: 'Cakes', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 480 },
    { restaurant: r8._id, name: 'Nutella Crepe', description: 'Thin French crepe filled with Nutella and sliced bananas, powdered sugar', price: 7.99, category: 'Crepes', image: 'https://images.unsplash.com/photo-1565299543923-37dd37887442?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 520 },
    { restaurant: r8._id, name: 'Sundae Bowl', description: 'Three scoops of premium ice cream, hot fudge, caramel, nuts, cherry', price: 9.99, category: 'Ice Cream', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 680 },
    { restaurant: r8._id, name: 'Cheesecake Slice', description: 'New York style creamy cheesecake on graham cracker crust, berry compote', price: 7.49, category: 'Cakes', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 440 },
    { restaurant: r8._id, name: 'Hot Chocolate', description: 'Rich velvety hot chocolate topped with mini marshmallows and whipped cream', price: 4.99, category: 'Drinks', image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&h=400&fit=crop', isVeg: true, spiceLevel: 'mild', calories: 310 },
  ]);

  console.log('🍔 Menu items created');

  console.log('\n✅ DATABASE SEEDED SUCCESSFULLY!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 LOGIN CREDENTIALS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 Admin:           admin@foodash.com     / admin123');
  console.log('🍕 Restaurant Owner: mario@foodash.com    / password123');
  console.log('🛒 Customer:        customer@foodash.com  / password123');
  console.log('🚴 Driver:          driver@foodash.com    / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n🏪 ${await Restaurant.countDocuments()} Restaurants`);
  console.log(`🍽️  ${await MenuItem.countDocuments()} Menu Items`);
  console.log(`👥 ${await User.countDocuments()} Users\n`);

  process.exit();
};

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});