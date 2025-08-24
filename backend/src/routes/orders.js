const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders - создать новый заказ
router.post('/', orderController.createOrder);


// GET /api/orders/:userId - получить заказы пользователя
router.get('/user/:userId', orderController.getUserOrders);

// GET /api/orders/:orderId - получить заказ по ID
router.get('/:orderId', orderController.getOrder);

// PUT /api/orders/:orderId/status - обновить статус заказа
router.put('/:orderId/status', orderController.updateOrderStatus);

module.exports = router;
