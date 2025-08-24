const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const telegramAuth = require('./middleware/telegramAuth');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Базовый route для проверки работы сервера
app.get('/', (req, res) => {
  res.json({ 
    message: 'JAN Delivery API сервер запущен!', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// Routes
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', telegramAuth, require('./routes/orders'));
app.use('/api/users', telegramAuth, require('./routes/users'));
app.use('/api/geocode', require('./routes/geocode'));
app.use('/api/waitlist', require('./routes/waitlist'));
app.use('/webhook', require('./routes/webhook'));

// Алиас под новый контракт создания заказа
const orderController = require('./controllers/orderController');
app.post('/api/create-order', telegramAuth, orderController.createOrder);

// Алиас для проверки зоны доставки
const geocodingService = require('./services/geocodingService');
app.post('/api/check-delivery-zone', async (req, res) => {
  try {
    const { address, latitude, longitude } = req.body || {};
    let inZone = false;
    if (address) {
      inZone = await geocodingService.isDeliveryAvailable(address);
    } else if (typeof latitude === 'number' && typeof longitude === 'number') {
      inZone = await geocodingService.isDeliveryAvailableByCoords(latitude, longitude);
    } else {
      return res.status(400).json({ success: false, error: 'address or coordinates required' });
    }
    res.json({ success: true, data: { inZone } });
  } catch (error) {
    console.error('Ошибка проверки зоны доставки:', error);
    res.status(500).json({ success: false, error: 'Check delivery zone failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint не найден' });
});

app.listen(PORT, () => {
  console.log(`🚀 JAN Delivery API сервер запущен на порту ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
