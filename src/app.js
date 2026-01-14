const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { syncDatabase } = require('./models');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const transporterRoutes = require('./routes/transporterRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/logistics', logisticsRoutes);
app.use('/api/v1/tracking', trackingRoutes);
app.use('/api/v1/transporter', transporterRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start Server
const startServer = async () => {
  await syncDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
