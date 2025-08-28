// Тест меню с новой таблицей локально
require('dotenv').config({ path: './.env' });

async function testMenu() {
  try {
    console.log('🍽️ Тестируем загрузку меню с новой таблицей...');
    
    // Импортируем сервис меню из backend
    const menuService = require('./backend/src/services/menuService.js');
    
    console.log('📋 Загружаем меню на русском...');
    const menuRu = await menuService.getAllItems('ru');
    console.log(`✅ Меню RU: ${menuRu.length} блюд`);
    
    if (menuRu.length > 0) {
      console.log('📄 Пример блюда:', {
        id: menuRu[0].id,
        name: menuRu[0].name,
        category: menuRu[0].category,
        subCategory: menuRu[0].subCategory,
        price: menuRu[0].price
      });
    }
    
    console.log('\n📋 Загружаем категории...');
    const categories = await menuService.getCategoriesWithSubCategories('ru');
    console.log('✅ Категории:', Object.keys(categories));
    
    // Показать структуру категорий
    Object.keys(categories).forEach(cat => {
      const subCats = categories[cat].subCategories;
      console.log(`   ${cat}: ${subCats.length > 0 ? subCats.join(', ') : 'без подкатегорий'}`);
    });
    
    console.log('\n🌍 Тестируем другие языки...');
    const menuEn = await menuService.getAllItems('en');
    const menuSr = await menuService.getAllItems('sr');
    
    console.log(`✅ Меню EN: ${menuEn.length} блюд`);
    console.log(`✅ Меню SR: ${menuSr.length} блюд`);
    
    if (menuEn.length > 0) {
      console.log('📄 Пример блюда EN:', {
        name: menuEn[0].name,
        category: menuEn[0].category,
        subCategory: menuEn[0].subCategory
      });
    }
    
    if (menuSr.length > 0) {
      console.log('📄 Пример блюда SR:', {
        name: menuSr[0].name,
        category: menuSr[0].category,
        subCategory: menuSr[0].subCategory
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
}

testMenu();