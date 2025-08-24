#!/usr/bin/env node

/**
 * Скрипт для тестирования подключения к Google Sheets
 * Использование: node scripts/test-sheets.js
 */

require('dotenv').config();
const { google } = require('googleapis');

class SheetsTestRunner {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    this.testResults = [];
  }

  async init() {
    console.log('🚀 Инициализация Google Sheets...\n');

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.addResult('✅ Google Sheets API инициализирован');
      return true;
    } catch (error) {
      this.addResult(`❌ Ошибка инициализации: ${error.message}`);
      return false;
    }
  }

  async testConnection() {
    console.log('🔗 Тестирование подключения...\n');

    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });

      this.addResult(`✅ Подключение к таблице: "${response.data.properties.title}"`);
      this.addResult(`📊 Количество листов: ${response.data.sheets.length}`);
      
      const sheetNames = response.data.sheets.map(sheet => sheet.properties.title);
      this.addResult(`📋 Листы: ${sheetNames.join(', ')}`);
      
      return { success: true, sheets: sheetNames };
    } catch (error) {
      this.addResult(`❌ Ошибка подключения: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async testMenuSheet() {
    console.log('🍕 Тестирование листа Menu...\n');

    try {
      // Проверка заголовков
      const headersResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Menu!A1:J1'
      });

      if (!headersResponse.data.values || headersResponse.data.values.length === 0) {
        this.addResult('⚠️  Лист Menu пустой или отсутствуют заголовки');
        return false;
      }

      const headers = headersResponse.data.values[0];
      const expectedHeaders = ['id', 'name', 'description', 'price', 'category', 'image', 'available', 'ingredients', 'weight', 'calories'];
      
      this.addResult(`📝 Заголовки Menu: ${headers.join(', ')}`);

      // Проверка структуры заголовков
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        this.addResult(`⚠️  Отсутствуют заголовки: ${missingHeaders.join(', ')}`);
      } else {
        this.addResult('✅ Все заголовки Menu на месте');
      }

      // Проверка данных
      const dataResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Menu!A2:J100'
      });

      const menuItems = dataResponse.data.values || [];
      this.addResult(`📊 Количество блюд в меню: ${menuItems.length}`);

      if (menuItems.length > 0) {
        // Анализ категорий
        const categories = [...new Set(menuItems.map(item => item[4]).filter(Boolean))];
        this.addResult(`🏷️  Категории: ${categories.join(', ')}`);

        // Проверка валидности данных
        let validItems = 0;
        let invalidItems = [];

        menuItems.forEach((item, index) => {
          const rowNum = index + 2;
          if (item[0] && item[1] && item[3] && item[4]) { // id, name, price, category
            validItems++;
          } else {
            invalidItems.push(rowNum);
          }
        });

        this.addResult(`✅ Валидных записей: ${validItems}`);
        if (invalidItems.length > 0) {
          this.addResult(`⚠️  Невалидные строки: ${invalidItems.join(', ')}`);
        }
      }

      return true;
    } catch (error) {
      this.addResult(`❌ Ошибка тестирования Menu: ${error.message}`);
      return false;
    }
  }

  async testOrdersSheet() {
    console.log('📦 Тестирование листа Orders...\n');

    try {
      const headersResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Orders!A1:L1'
      });

      if (!headersResponse.data.values || headersResponse.data.values.length === 0) {
        this.addResult('⚠️  Лист Orders пустой или отсутствуют заголовки');
        return false;
      }

      const headers = headersResponse.data.values[0];
      const expectedHeaders = ['id', 'userId', 'userInfo', 'items', 'total', 'address', 'coordinates', 'status', 'createdAt', 'estimatedDelivery', 'phone', 'notes'];
      
      this.addResult(`📝 Заголовки Orders: ${headers.join(', ')}`);

      // Проверка структуры
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        this.addResult(`⚠️  Отсутствуют заголовки: ${missingHeaders.join(', ')}`);
      } else {
        this.addResult('✅ Все заголовки Orders на месте');
      }

      // Проверка данных
      const dataResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Orders!A2:L100'
      });

      const orders = dataResponse.data.values || [];
      this.addResult(`📊 Количество заказов: ${orders.length}`);

      if (orders.length > 0) {
        // Анализ статусов
        const statuses = [...new Set(orders.map(order => order[7]).filter(Boolean))];
        this.addResult(`📋 Статусы заказов: ${statuses.join(', ')}`);

        // Проверка JSON полей
        let validJsonCount = 0;
        orders.forEach((order, index) => {
          try {
            if (order[2]) JSON.parse(order[2]); // userInfo
            if (order[3]) JSON.parse(order[3]); // items
            if (order[6]) JSON.parse(order[6]); // coordinates
            validJsonCount++;
          } catch (e) {
            this.addResult(`⚠️  Невалидный JSON в строке ${index + 2}`);
          }
        });

        this.addResult(`✅ Валидных JSON записей: ${validJsonCount}/${orders.length}`);
      }

      return true;
    } catch (error) {
      this.addResult(`❌ Ошибка тестирования Orders: ${error.message}`);
      return false;
    }
  }

  async testUsersSheet() {
    console.log('👥 Тестирование листа Users...\n');

    try {
      const headersResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A1:I1'
      });

      if (!headersResponse.data.values || headersResponse.data.values.length === 0) {
        this.addResult('⚠️  Лист Users пустой или отсутствуют заголовки');
        return false;
      }

      const headers = headersResponse.data.values[0];
      const expectedHeaders = ['userId', 'first_name', 'last_name', 'username', 'language_code', 'phone', 'address', 'createdAt', 'updatedAt'];
      
      this.addResult(`📝 Заголовки Users: ${headers.join(', ')}`);

      // Проверка структуры
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        this.addResult(`⚠️  Отсутствуют заголовки: ${missingHeaders.join(', ')}`);
      } else {
        this.addResult('✅ Все заголовки Users на месте');
      }

      // Проверка данных
      const dataResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Users!A2:I100'
      });

      const users = dataResponse.data.values || [];
      this.addResult(`📊 Количество пользователей: ${users.length}`);

      if (users.length > 0) {
        // Анализ языков
        const languages = [...new Set(users.map(user => user[4]).filter(Boolean))];
        this.addResult(`🌐 Языки: ${languages.join(', ')}`);

        // Количество пользователей с телефонами
        const usersWithPhones = users.filter(user => user[5]).length;
        this.addResult(`📞 Пользователей с телефонами: ${usersWithPhones}/${users.length}`);
      }

      return true;
    } catch (error) {
      this.addResult(`❌ Ошибка тестирования Users: ${error.message}`);
      return false;
    }
  }

  async testWriteOperation() {
    console.log('✏️  Тестирование операций записи...\n');

    try {
      // Тестовая запись в лист Menu
      const testMenuData = [
        ['test001', 'Тестовое блюдо', 'Описание тестового блюда', 999, 'тест', '', 'FALSE', 'тестовые ингредиенты', '100г', 100]
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Menu!A:J',
        valueInputOption: 'USER_ENTERED',
        resource: { values: testMenuData }
      });

      this.addResult('✅ Тестовая запись в Menu успешна');

      // Удаление тестовой записи
      const menuData = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Menu!A:A'
      });

      const menuRows = menuData.data.values || [];
      const testRowIndex = menuRows.findIndex(row => row[0] === 'test001');

      if (testRowIndex > 0) {
        await this.sheets.spreadsheets.values.clear({
          spreadsheetId: this.spreadsheetId,
          range: `Menu!A${testRowIndex + 1}:J${testRowIndex + 1}`
        });
        this.addResult('✅ Тестовая запись удалена');
      }

      return true;
    } catch (error) {
      this.addResult(`❌ Ошибка операции записи: ${error.message}`);
      return false;
    }
  }

  addResult(message) {
    this.testResults.push(message);
    console.log(message);
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📋 СВОДКА ТЕСТИРОВАНИЯ');
    console.log('='.repeat(50));
    
    const successful = this.testResults.filter(r => r.startsWith('✅')).length;
    const warnings = this.testResults.filter(r => r.startsWith('⚠️')).length;
    const errors = this.testResults.filter(r => r.startsWith('❌')).length;

    console.log(`✅ Успешно: ${successful}`);
    console.log(`⚠️  Предупреждения: ${warnings}`);
    console.log(`❌ Ошибки: ${errors}`);

    if (errors === 0) {
      console.log('\n🎉 Все тесты пройдены успешно!');
      console.log('Ваша Google Sheets настроена правильно.');
    } else {
      console.log('\n🔧 Требуется исправление ошибок.');
      console.log('Проверьте конфигурацию и структуру таблицы.');
    }
  }

  async run() {
    console.log('📊 JAN Delivery - Тестирование Google Sheets');
    console.log('='.repeat(50) + '\n');

    // Проверка переменных окружения
    if (!process.env.GOOGLE_SHEETS_ID) {
      console.log('❌ GOOGLE_SHEETS_ID не установлен в .env файле');
      return;
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      console.log('❌ GOOGLE_SERVICE_ACCOUNT_EMAIL не установлен в .env файле');
      return;
    }

    if (!process.env.GOOGLE_PRIVATE_KEY) {
      console.log('❌ GOOGLE_PRIVATE_KEY не установлен в .env файле');
      return;
    }

    const initSuccess = await this.init();
    if (!initSuccess) {
      this.printSummary();
      return;
    }

    const connectionResult = await this.testConnection();
    if (!connectionResult.success) {
      this.printSummary();
      return;
    }

    // Тестирование листов
    await this.testMenuSheet();
    await this.testOrdersSheet(); 
    await this.testUsersSheet();
    await this.testWriteOperation();

    this.printSummary();
  }
}

// Запуск тестов
if (require.main === module) {
  const tester = new SheetsTestRunner();
  tester.run().catch(error => {
    console.error('Критическая ошибка:', error);
    process.exit(1);
  });
}

module.exports = SheetsTestRunner;