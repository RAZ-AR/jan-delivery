const googleSheetsService = require('./googleSheetsService');
const telegramService = require('./telegramService');

class OrderService {
  constructor() {
    this.sheetName = 'Orders';
  }

  // Создать новый заказ
  async createOrder(orderData) {
    try {
      const orderId = this.generateOrderId();
      const timestamp = new Date().toISOString();
      
      const order = {
        id: orderId,
        userId: orderData.userId,
        userInfo: JSON.stringify(orderData.userInfo || {}),
        items: JSON.stringify(orderData.items),
        total: orderData.total,
        address: orderData.address,
        coordinates: orderData.coordinates ? JSON.stringify(orderData.coordinates) : '',
        status: 'pending',
        createdAt: timestamp,
        estimatedDelivery: this.calculateDeliveryTime(),
        phone: orderData.phone || '',
        notes: orderData.notes || '',
        payment_method: orderData.payment_method || 'cash'
      };

      // Добавить в Google Sheets
      const values = [
        order.id,
        order.userId,
        order.userInfo,
        order.items,
        order.total,
        order.address,
        order.coordinates,
        order.status,
        order.createdAt,
        order.estimatedDelivery,
        order.phone,
        order.notes,
        order.payment_method
      ];

      await googleSheetsService.appendToSheet(this.sheetName, values);

      // Отправить уведомление в Telegram
      await telegramService.sendOrderNotification(orderData.userId, order);

      // Автоподтверждение через 30 секунд
      setTimeout(async () => {
        try {
          if (order.status === 'pending') {
            await this.updateOrderStatus(order.id, 'confirmed');
          }
        } catch (e) {
          console.error('Автоподтверждение не удалось:', e.message);
        }
      }, 30_000);

      return order;
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      throw error;
    }
  }

  // Получить заказы пользователя
  async getUserOrders(userId) {
    try {
      const data = await googleSheetsService.getSheetData(this.sheetName);
      
      if (!data || data.length === 0) {
        return [];
      }

      const orders = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[1] === userId) { // userId в колонке B
          orders.push(this.parseOrderFromRow(row));
        }
      }

      return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Ошибка получения заказов пользователя:', error);
      throw error;
    }
  }

  // Получить заказ по ID
  async getOrderById(orderId) {
    try {
      const result = await googleSheetsService.findRowByValue(this.sheetName, 0, orderId);
      return result ? this.parseOrderFromRow(result.data) : null;
    } catch (error) {
      console.error('Ошибка получения заказа:', error);
      throw error;
    }
  }

  // Обновить статус заказа
  async updateOrderStatus(orderId, status) {
    try {
      const result = await googleSheetsService.findRowByValue(this.sheetName, 0, orderId);
      
      if (!result) {
        throw new Error('Заказ не найден');
      }

      // Обновить статус в строке
      result.data[7] = status; // Статус в колонке H
      
      await googleSheetsService.updateSheetRow(this.sheetName, result.row, result.data);

      const order = this.parseOrderFromRow(result.data);
      
      // Отправить уведомление о смене статуса
      await telegramService.sendStatusUpdate(order.userId, order);

      return order;
    } catch (error) {
      console.error('Ошибка обновления статуса заказа:', error);
      throw error;
    }
  }

  // Парсинг строки заказа
  parseOrderFromRow(row) {
    return {
      id: row[0] || '',
      userId: row[1] || '',
      userInfo: this.safeParseJSON(row[2]),
      items: this.safeParseJSON(row[3]),
      total: parseFloat(row[4]) || 0,
      address: row[5] || '',
      coordinates: this.safeParseJSON(row[6]),
      status: row[7] || 'pending',
      createdAt: row[8] || '',
      estimatedDelivery: row[9] || '',
      phone: row[10] || '',
      notes: row[11] || '',
      payment_method: row[12] || 'cash'
    };
  }

  // Безопасный парсинг JSON
  safeParseJSON(str) {
    try {
      return str ? JSON.parse(str) : {};
    } catch {
      return {};
    }
  }

  // Генерация ID заказа
  generateOrderId() {
    return 'JAN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  // Расчет времени доставки
  calculateDeliveryTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 45); // 45 минут на доставку
    return now.toLocaleString('ru-RU');
  }
}

module.exports = new OrderService();
