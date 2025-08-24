const googleSheetsService = require('./googleSheetsService');
const NodeCache = require('node-cache');

class MenuService {
  constructor() {
    this.sheetName = 'Menu';
    this.cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
  }

  // Получить все блюда из меню
  async getAllItems() {
    const cached = this.cache.get('menu');
    if (cached) return cached;

    try {
      const data = await googleSheetsService.getSheetData(this.sheetName);
      
      if (!data || data.length === 0) {
        return [];
      }

      // Первая строка - заголовки
      const headers = data[0] || [];
      const items = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row.length === 0 || !row[0]) continue; // Пропустить пустые строки

        // Гибкое сопоставление по заголовкам, чтобы поддержать
        // структуру: id, category, title, weight, price, image
        const idx = (name) => headers.findIndex(h => String(h).toLowerCase() === name);

        const id = row[idx('id')] ?? row[0];
        const category = row[idx('category')] ?? row[4] ?? '';
        const title = row[idx('title')] ?? row[1] ?? '';
        const weight = row[idx('weight')] ?? row[8] ?? '';
        const priceRaw = row[idx('price')] ?? row[3] ?? '0';
        const image = row[idx('image')] ?? row[5] ?? '';

        const description = row[idx('description')] ?? row[2] ?? '';
        const ingredientsStr = row[idx('ingredients')] ?? row[7] ?? '';
        const caloriesRaw = row[idx('calories')] ?? row[9] ?? '';
        const availableVal = row[idx('available')] ?? row[6] ?? 'TRUE';

        const item = {
          id: String(id || ''),
          name: String(title || ''),
          description: String(description || ''),
          price: parseFloat(priceRaw) || 0,
          category: String(category || ''),
          image: String(image || ''),
          available: String(availableVal).toLowerCase() === 'true' || String(availableVal) === '1',
          ingredients: ingredientsStr ? String(ingredientsStr).split(',').map(i => i.trim()).filter(Boolean) : [],
          weight: String(weight || ''),
          calories: parseInt(caloriesRaw) || 0
        };

        items.push(item);
      }

      this.cache.set('menu', items);
      return items;
    } catch (error) {
      console.error('Ошибка загрузки меню:', error);
      return this.cache.get('menu') || [];
    }
  }

  // Получить блюдо по ID
  async getItemById(id) {
    const items = await this.getAllItems();
    return items.find(item => item.id === id);
  }

  // Получить блюда по категории
  async getItemsByCategory(category) {
    const items = await this.getAllItems();
    return items.filter(item => 
      item.category.toLowerCase() === category.toLowerCase() && item.available
    );
  }

  // Очистить кэш
  clearCache() {
    this.cache.del('menu');
  }
}

module.exports = new MenuService();
