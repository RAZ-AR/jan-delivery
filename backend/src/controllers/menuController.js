const menuService = require('../services/menuService');

const menuController = {
  // Получить все блюда
  async getMenu(req, res) {
    try {
      const { lang = 'ru' } = req.query; // Язык по умолчанию - русский
      const allItems = await menuService.getAllItems(lang);
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
      const { lang = 'ru' } = req.query;
      const item = await menuService.getItemById(id, lang);
      
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
      const { lang = 'ru' } = req.query;
      const items = await menuService.getItemsByCategory(category, lang);
      
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
  },

  // Получить блюда по подкатегории
  async getMenuBySubCategory(req, res) {
    try {
      const { subCategory } = req.params;
      const { lang = 'ru' } = req.query;
      const items = await menuService.getItemsBySubCategory(subCategory, lang);
      
      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      console.error('Ошибка при получении подкатегории:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось загрузить подкатегорию'
      });
    }
  },

  // Получить структуру категорий с подкатегориями
  async getCategoriesStructure(req, res) {
    try {
      const { lang = 'ru' } = req.query;
      const structure = await menuService.getCategoriesWithSubCategories(lang);
      
      res.json({
        success: true,
        data: structure
      });
    } catch (error) {
      console.error('Ошибка при получении структуры категорий:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось загрузить структуру категорий'
      });
    }
  },

  // Получить подкатегории для конкретной категории
  async getSubCategories(req, res) {
    try {
      const { category } = req.params;
      const { lang = 'ru' } = req.query;
      const subCategories = await menuService.getSubCategoriesByCategory(category, lang);
      
      res.json({
        success: true,
        data: subCategories
      });
    } catch (error) {
      console.error('Ошибка при получении подкатегорий:', error);
      res.status(500).json({
        success: false,
        error: 'Не удалось загрузить подкатегории'
      });
    }
  },

  // Debug информация о таблице
  async getDebugInfo(req, res) {
    try {
      const { lang = 'ru' } = req.query;
      const allItems = await menuService.getAllItems(lang);
      const categories = await menuService.getCategoriesWithSubCategories(lang);
      
      res.json({
        success: true,
        debug: {
          googleSheetsId: process.env.GOOGLE_SHEETS_ID,
          totalItems: allItems.length,
          availableItems: allItems.filter(item => item.available).length,
          categoriesCount: Object.keys(categories).length,
          categories: Object.keys(categories),
          timestamp: new Date().toISOString(),
          sampleItem: allItems[0] || null
        }
      });
    } catch (error) {
      console.error('Ошибка при получении debug информации:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка debug информации',
        debug: {
          googleSheetsId: process.env.GOOGLE_SHEETS_ID,
          timestamp: new Date().toISOString()
        }
      });
    }
  }
};

module.exports = menuController;