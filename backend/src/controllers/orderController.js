const orderService = require('../services/orderService');
const geocodingService = require('../services/geocodingService');

const orderController = {
  // Создать новый заказ
  async createOrder(req, res) {
    try {
      const orderData = req.body;
      
      // Валидация данных заказа
      if (!orderData.userId || !orderData.items || !orderData.address) {
        return res.status(400).json({
          success: false,
          error: 'Не хватает обязательных данных заказа'
        });
      }

      // Проверка зоны доставки (Белград 15км)
      const inZone = await geocodingService.isDeliveryAvailable(orderData.address);
      if (!inZone) {
        return res.status(200).json({
          success: true,
          data: { waitlisted: true, reason: 'out_of_zone' }
        });
      }

      // Геокодирование адреса
      const coordinates = await geocodingService.geocodeAddress(orderData.address);
      if (coordinates) orderData.coordinates = coordinates;

      // Создание заказа
      const order = await orderService.createOrder(orderData);
      
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось создать заказ'
      });
    }
  },

  // Получить заказы пользователя
  async getUserOrders(req, res) {
    try {
      const { userId } = req.params;
      const orders = await orderService.getUserOrders(userId);
      
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('Ошибка при получении заказов:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось загрузить заказы'
      });
    }
  },

  // Получить заказ по ID
  async getOrder(req, res) {
    try {
      const { orderId } = req.params;
      const order = await orderService.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Заказ не найден'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Ошибка при получении заказа:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось загрузить заказ'
      });
    }
  },

  // Обновить статус заказа
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      
      const order = await orderService.updateOrderStatus(orderId, status);
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось обновить статус заказа'
      });
    }
  }
};

module.exports = orderController;
