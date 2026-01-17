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
const bulkRoutes = require('./routes/bulkRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const routeRoutes = require('./routes/routeRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const coldChainRoutes = require('./routes/coldChainRoutes');
const stockRoutes = require('./routes/stockRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const mobileRoutes = require('./routes/mobileRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');

const helmet = require('helmet');
const morgan = require('morgan');
const { limiter, authLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(limiter); // Global Rate Limit
app.use('/api/v1/auth', authLimiter); // Stricter Auth Limit

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

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
app.use('/api/v1/bulk', bulkRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/certification', certificationRoutes);
app.use('/api/v1/schemes', schemeRoutes);
app.use('/api/v1/forecast', forecastRoutes);
app.use('/api/v1/routes', routeRoutes);
app.use('/api/v1/matching', matchingRoutes);
app.use('/api/v1/coldchain', coldChainRoutes);
app.use('/api/v1/stock', stockRoutes);
app.use('/api/v1/waste', wasteRoutes);
app.use('/api/v1/mobile', mobileRoutes);
console.log('Registering Admin Routes...');
console.log('AdminRoutes Type:', typeof adminRoutes);
console.log('Is Router:', !!adminRoutes.name || !!adminRoutes.handle || !!adminRoutes.stack);
app.use('/api/v1/admin', adminRoutes);
console.log('Registering Report Routes...');
console.log('ReportRoutes Type:', typeof reportRoutes);
app.use('/api/v1/reports', reportRoutes);
console.log('Registering Monitoring Routes...');
app.use('/api/v1/monitoring', monitoringRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('GoSEWA Backend is running. Access the Frontend at <a href="http://localhost:5173">http://localhost:5173</a>');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
  await syncDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
