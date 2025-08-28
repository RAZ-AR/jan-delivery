const googleSheetsService = require('./googleSheetsService');
const NodeCache = require('node-cache');

class MenuService {
  constructor() {
    this.sheetName = 'Menu';
    this.cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
  }

  // Получить все блюда из меню
  async getAllItems(lang = 'ru') {
    const cacheKey = `menu-${lang}`;
    const cached = this.cache.get(cacheKey);
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

        // Гибкое сопоставление по заголовкам с поддержкой многоязычности
        const idx = (name) => headers.findIndex(h => String(h).toLowerCase() === name);

        const id = row[idx('id')] ?? row[0];
        const category = row[idx('category')] ?? row[4] ?? '';
        
        // Многоязычная поддержка названий и описаний
        let title, description;
        if (lang === 'en') {
          title = row[idx('title_en')] ?? row[idx('name_en')] ?? row[idx('title')] ?? row[1] ?? '';
          description = row[idx('description_en')] ?? row[idx('description')] ?? row[2] ?? '';
        } else if (lang === 'sr') {
          title = row[idx('title_sr')] ?? row[idx('name_sr')] ?? row[idx('title')] ?? row[1] ?? '';
          description = row[idx('description_sr')] ?? row[idx('description')] ?? row[2] ?? '';
        } else {
          title = row[idx('title')] ?? row[idx('name')] ?? row[1] ?? '';
          description = row[idx('description')] ?? row[2] ?? '';
        }
        
        const weight = row[idx('weight')] ?? row[8] ?? '';
        const priceRaw = row[idx('price')] ?? row[3] ?? '0';
        const image = row[idx('image')] ?? row[5] ?? '';

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
          available: !availableVal || String(availableVal).toLowerCase() === 'true' || String(availableVal) === '1' || String(availableVal).toLowerCase() === 'да',
          ingredients: ingredientsStr ? String(ingredientsStr).split(',').map(i => i.trim()).filter(Boolean) : [],
          weight: String(weight || ''),
          calories: parseInt(caloriesRaw) || 0
        };

        items.push(item);
      }

      this.cache.set(cacheKey, items);
      return items;
    } catch (error) {
      console.error('Ошибка загрузки меню:', error);
      return this.cache.get(cacheKey) || [];
    }
  }

  // Получить блюдо по ID
  async getItemById(id, lang = 'ru') {
    const items = await this.getAllItems(lang);
    return items.find(item => item.id === id);
  }

  // Получить блюда по категории
  async getItemsByCategory(category, lang = 'ru') {
    const items = await this.getAllItems(lang);
    return items.filter(item => 
      item.category.toLowerCase() === category.toLowerCase() && item.available
    );
  }

  // Очистить кэш
  clearCache() {
    // Очищаем кэш для всех языков
    ['ru', 'en', 'sr'].forEach(lang => {
      this.cache.del(`menu-${lang}`);
    });
  }
}

module.exports = new MenuService();
