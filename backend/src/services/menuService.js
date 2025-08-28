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

        // Маппинг по новой структуре: id, category, sub_category, sub_category_en, sub_category_sr, title, title_en, title_sr, description, description_en, description_sr, price, image, available, ingredients, weight, calories
        const idx = (name) => headers.findIndex(h => String(h).toLowerCase().trim() === name.toLowerCase());

        const id = row[idx('id')] ?? row[0] ?? '';
        const category = row[idx('category')] ?? row[1] ?? '';
        
        // Многоязычная поддержка подкатегорий
        let subCategory;
        if (lang === 'en') {
          subCategory = row[idx('sub_category_en')] ?? row[3] ?? row[idx('sub_category')] ?? row[2] ?? '';
        } else if (lang === 'sr') {
          subCategory = row[idx('sub_category_sr')] ?? row[4] ?? row[idx('sub_category')] ?? row[2] ?? '';
        } else {
          // Русский язык (по умолчанию)
          subCategory = row[idx('sub_category')] ?? row[2] ?? '';
        }
        
        // Многоязычная поддержка названий и описаний
        let title, description;
        if (lang === 'en') {
          title = row[idx('title_en')] ?? row[6] ?? row[idx('title')] ?? row[5] ?? '';
          description = row[idx('description_en')] ?? row[9] ?? row[idx('description')] ?? row[8] ?? '';
        } else if (lang === 'sr') {
          title = row[idx('title_sr')] ?? row[7] ?? row[idx('title')] ?? row[5] ?? '';
          description = row[idx('description_sr')] ?? row[10] ?? row[idx('description')] ?? row[8] ?? '';
        } else {
          // Русский язык (по умолчанию)
          title = row[idx('title')] ?? row[5] ?? '';
          description = row[idx('description')] ?? row[8] ?? '';
        }
        
        const priceRaw = row[idx('price')] ?? row[11] ?? '0';
        const image = row[idx('image')] ?? row[12] ?? '';
        const availableVal = row[idx('available')] ?? row[13] ?? 'TRUE';
        const ingredientsStr = row[idx('ingredients')] ?? row[14] ?? '';
        const weight = row[idx('weight')] ?? row[15] ?? '';
        const caloriesRaw = row[idx('calories')] ?? row[16] ?? '';

        const item = {
          id: String(id || ''),
          name: String(title || ''),
          description: String(description || ''),
          price: parseFloat(priceRaw) || 0,
          category: String(category || ''),
          subCategory: String(subCategory || ''),
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

  // Получить блюда по подкатегории
  async getItemsBySubCategory(subCategory, lang = 'ru') {
    const items = await this.getAllItems(lang);
    return items.filter(item => 
      item.subCategory.toLowerCase() === subCategory.toLowerCase() && item.available
    );
  }

  // Получить все категории с подкатегориями
  async getCategoriesWithSubCategories(lang = 'ru') {
    const items = await this.getAllItems(lang);
    const categories = {};

    items.forEach(item => {
      if (!item.available) return;
      
      const category = item.category;
      const subCategory = item.subCategory;
      
      if (!categories[category]) {
        categories[category] = {
          name: category,
          subCategories: new Set()
        };
      }
      
      if (subCategory) {
        categories[category].subCategories.add(subCategory);
      }
    });

    // Конвертируем Set в Array
    Object.keys(categories).forEach(category => {
      categories[category].subCategories = Array.from(categories[category].subCategories);
    });

    return categories;
  }

  // Получить подкатегории для конкретной категории
  async getSubCategoriesByCategory(category, lang = 'ru') {
    const items = await this.getAllItems(lang);
    const subCategories = new Set();

    items.forEach(item => {
      if (item.available && 
          item.category.toLowerCase() === category.toLowerCase() && 
          item.subCategory) {
        subCategories.add(item.subCategory);
      }
    });

    return Array.from(subCategories);
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
