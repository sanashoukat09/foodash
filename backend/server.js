const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] }
});

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menu',        require('./routes/menu'));
app.use('/api/orders',      require('./routes/orders'));
app.use('/api/payments',    require('./routes/payments'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/drivers',     require('./routes/drivers'));
app.use('/api/reviews',     require('./routes/reviews'));

// Socket.io
require('./socket')(io);

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const path = require('path');
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = { io };
