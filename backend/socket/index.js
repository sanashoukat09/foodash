module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // Customer joins their personal room
    socket.on('join_customer', (userId) => {
      socket.join(`customer_${userId}`);
    });

    // Customer tracks a specific order
    socket.on('track_order', (orderId) => {
      socket.join(`order_${orderId}`);
    });

    // Restaurant owner joins their restaurant room
    socket.on('join_restaurant', (restaurantId) => {
      socket.join(`restaurant_${restaurantId}`);
    });

    // Driver joins driver room
    socket.on('join_driver', (driverId) => {
      socket.join(`driver_${driverId}`);
    });

    // Driver location update
    socket.on('driver_location', ({ orderId, location }) => {
      io.to(`order_${orderId}`).emit('driver_location_update', { location });
    });

    // Chat message
    socket.on('send_message', ({ orderId, message, senderId, senderName }) => {
      const msg = { orderId, message, senderId, senderName, time: new Date() };
      io.to(`order_${orderId}`).emit('receive_message', msg);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });
};
