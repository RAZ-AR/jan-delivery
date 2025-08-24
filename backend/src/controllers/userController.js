const userService = require('../services/userService');

const userController = {
  // Создать или обновить пользователя
  async createOrUpdateUser(req, res) {
    try {
      const userData = req.body;
      
      // Валидация Telegram данных
      if (!userData.userId || !userData.first_name) {
        return res.status(400).json({
          success: false,
          error: 'Не хватает обязательных данных пользователя'
        });
      }

      const user = await userService.createOrUpdateUser(userData);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось создать пользователя'
      });
    }
  },

  // Получить пользователя по ID
  async getUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Пользователь не найден'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Ошибка при получении пользователя:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось загрузить пользователя'
      });
    }
  },

  // Обновить адрес пользователя
  async updateUserAddress(req, res) {
    try {
      const { userId } = req.params;
      const { address } = req.body;
      
      const user = await userService.updateUserAddress(userId, address);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Ошибка при обновлении адреса:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось обновить адрес'
      });
    }
  }
};

module.exports = userController;
