// Тест новой Google Sheets таблицы
const { google } = require('./backend/node_modules/googleapis');

// Новая таблица из пользовательской ссылки
const NEW_SPREADSHEET_ID = '1TOHGRsYeoG0oo2ywJ2G9DJhb7mmcSxJvLBsiEiMIYIs';

async function testNewSpreadsheet() {
  try {
    console.log('🔍 Тестируем новую таблицу:', NEW_SPREADSHEET_ID);
    
    // Инициализируем auth с существующими credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Получаем список листов
    console.log('📋 Получаем список листов...');
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: NEW_SPREADSHEET_ID
    });
    
    const sheetNames = metadata.data.sheets.map(sheet => sheet.properties.title);
    console.log('✅ Листы найдены:', sheetNames);
    
    // Пробуем каждый лист
    for (const sheetName of sheetNames) {
      console.log(`\n🔎 Анализируем лист: ${sheetName}`);
      
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: NEW_SPREADSHEET_ID,
          range: `${sheetName}!A1:Z10` // Получаем первые 10 строк для анализа
        });

        const data = response.data.values || [];
        
        if (data.length === 0) {
          console.log(`❌ Лист ${sheetName} пуст`);
          continue;
        }
        
        console.log(`✅ Лист ${sheetName}:`);
        console.log(`   Строк: ${data.length}`);
        console.log(`   Заголовки:`, data[0]);
        
        if (data.length > 1) {
          console.log(`   Пример данных:`, data[1]);
        }
        
      } catch (error) {
        console.log(`❌ Ошибка чтения листа ${sheetName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования таблицы:', error);
  }
}

// Запуск если есть credentials
if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
  testNewSpreadsheet();
} else {
  console.log('⚠️ Для тестирования нужны переменные окружения GOOGLE_SERVICE_ACCOUNT_EMAIL и GOOGLE_PRIVATE_KEY');
}