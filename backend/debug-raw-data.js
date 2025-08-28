// Проверяем сырые данные из Google Sheets
require('dotenv').config({ path: '../.env' });

async function debugRawData() {
  try {
    const googleSheetsService = require('./src/services/googleSheetsService.js');
    
    console.log('🔍 Получаем сырые данные из Google Sheets...');
    
    const data = await googleSheetsService.getSheetData('Menu');
    console.log(`📊 Всего строк: ${data.length}`);
    
    if (data.length > 0) {
      console.log('📋 Заголовки:', data[0]);
      
      // Ищем строки с проблемными ID
      const problemIds = ['000028', '000051', '000052', '000053', '000068', '000069'];
      
      console.log('\n🔍 Проблемные строки:');
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const id = row[0]; // Предполагаем ID в первой колонке
        
        if (problemIds.includes(id)) {
          console.log(`\n🚫 Строка ${i + 1} (ID: ${id}):`);
          row.forEach((cell, colIndex) => {
            console.log(`   Колонка ${colIndex}: "${cell}"`);
          });
        }
      }
      
      // Проверим последние 20 строк
      console.log('\n📄 Последние строки таблицы:');
      const startFrom = Math.max(1, data.length - 5);
      for (let i = startFrom; i < data.length; i++) {
        const row = data[i];
        console.log(`\nСтрока ${i + 1}:`);
        console.log(`   ID: "${row[0]}"`);
        console.log(`   Title: "${row[5]}"`); // title обычно в 5 колонке
        console.log(`   Category: "${row[1]}"`);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

debugRawData();