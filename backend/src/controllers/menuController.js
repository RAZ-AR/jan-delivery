const menuService = require('../services/menuService');

const menuController = {
  // Получить все блюда
  async getMenu(req, res) {
    try {
      const allItems = await menuService.getAllItems();
      // Фильтруем только доступные блюда с названиями
      const menu = allItems.filter(item => item.available && item.name && item.name.trim() !== '');
      res.json({
        success: true,
        data: menu
      });
    } catch (error) {
      console.error('Ошибка при получении меню:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось загрузить меню'
      });
    }
  },

  // Получить блюдо по ID
  async getMenuItem(req, res) {
    try {
      const { id } = req.params;
      const item = await menuService.getItemById(id);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Блюдо не найдено'
        });
      }

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      console.error('Ошибка при получении блюда:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось загрузить блюдо'
      });
    }
  },

  // Получить блюда по категории
  async getMenuByCategory(req, res) {
    try {
      const { category } = req.params;
      const items = await menuService.getItemsByCategory(category);
      
      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      console.error('Ошибка при получении категории:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось загрузить категорию'
      });
    }
  }
};

module.exports = menuController;