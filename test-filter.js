// Тестируем фильтрацию меню
require('dotenv').config({ path: './.env' });

async function testFilter() {
  try {
    const menuService = require('./backend/src/services/menuService.js');
    
    console.log('🔍 Тестируем фильтрацию меню...');
    
    const allItems = await menuService.getAllItems('ru');
    console.log(`📊 Всего блюд загружено: ${allItems.length}`);
    
    // Фильтр из контроллера
    const filtered = allItems.filter(item => item.available && item.name && item.name.trim() !== '');
    console.log(`✅ Блюд после фильтрации: ${filtered.length}`);
    
    // Найти блюда, которые не прошли фильтр
    const rejected = allItems.filter(item => !(item.available && item.name && item.name.trim() !== ''));
    console.log(`❌ Блюд отклонено: ${rejected.length}`);
    
    if (rejected.length > 0) {
      console.log('\n🚫 Отклоненные блюда:');
      rejected.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}`);
        console.log(`   Name: "${item.name}"`);
        console.log(`   Available: ${item.available}`);
        console.log(`   Category: ${item.category}`);
        console.log(`   ---`);
      });
    }
    
    // Группировка по причинам отклонения
    const notAvailable = allItems.filter(item => !item.available);
    const noName = allItems.filter(item => !item.name || item.name.trim() === '');
    
    console.log(`\n📈 Причины отклонения:`);
    console.log(`   Недоступные (available = false): ${notAvailable.length}`);
    console.log(`   Без названия или пустое название: ${noName.length}`);
    
    if (noName.length > 0) {
      console.log('\n📝 Блюда без названий:');
      noName.slice(0, 5).forEach(item => {
        console.log(`   ID: ${item.id}, Name: "${item.name}", Category: ${item.category}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

testFilter();