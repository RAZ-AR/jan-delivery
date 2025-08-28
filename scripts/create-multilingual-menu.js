#!/usr/bin/env node

/**
 * Скрипт для создания многоязычной структуры меню в Google Sheets
 * 
 * Использование:
 * node scripts/create-multilingual-menu.js
 */

const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
require('dotenv').config();

class MultilingualMenuSetup {
  constructor() {
    this.auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      scopes: ['https://www.googleapis.com/spreadsheets'],
    });
    
    this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    this.sheetName = 'Menu';
  }

  async init() {
    console.log('🌍 Настройка многоязычной структуры меню...');
    
    try {
      const sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      // Получаем текущие данные
      const currentData = await this.getCurrentData(sheets);
      
      // Создаем новую структуру с языковыми столбцами
      const newStructure = this.createMultilingualStructure(currentData);
      
      // Обновляем таблицу
      await this.updateSheet(sheets, newStructure);
      
      console.log('✅ Многоязычная структура успешно создана!');
      console.log('📋 Теперь заполните переводы в Google Sheets');
      
    } catch (error) {
      console.error('❌ Ошибка:', error.message);
      process.exit(1);
    }
  }

  async getCurrentData(sheets) {
    console.log('📖 Читаем текущие данные...');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${this.sheetName}!A:Z`,
    });

    return response.data.values || [];
  }

  createMultilingualStructure(currentData) {
    console.log('🔧 Создаем многоязычную структуру...');
    
    // Новая структура заголовков
    const newHeaders = [
      'id',
      'category', 
      'title',          // Русский
      'title_en',       // Английский
      'title_sr',       // Сербский
      'description',    // Русский
      'description_en', // Английский
      'description_sr', // Сербский
      'price',
      'weight',
      'image',
      'available',
      'ingredients',
      'calories'
    ];

    // Если данных нет, создаем только заголовки
    if (currentData.length === 0) {
      return [newHeaders, this.createSampleData()];
    }

    const result = [newHeaders];
    const oldHeaders = currentData[0] || [];
    
    // Функция для поиска индекса столбца
    const getColumnIndex = (name) => {
      return oldHeaders.findIndex(header => 
        String(header).toLowerCase().includes(name.toLowerCase())
      );
    };

    // Обрабатываем существующие данные
    for (let i = 1; i < currentData.length; i++) {
      const row = currentData[i] || [];
      
      const newRow = [
        row[getColumnIndex('id')] || row[0] || '',
        row[getColumnIndex('category')] || row[4] || '',
        row[getColumnIndex('title')] || row[1] || '', // Русский оригинал
        '', // title_en - нужно заполнить
        '', // title_sr - нужно заполнить
        row[getColumnIndex('description')] || row[2] || '', // Русский оригинал
        '', // description_en - нужно заполнить
        '', // description_sr - нужно заполнить
        row[getColumnIndex('price')] || row[3] || '0',
        row[getColumnIndex('weight')] || row[8] || '',
        row[getColumnIndex('image')] || row[5] || '',
        row[getColumnIndex('available')] || row[6] || 'TRUE',
        row[getColumnIndex('ingredients')] || row[7] || '',
        row[getColumnIndex('calories')] || row[9] || ''
      ];

      result.push(newRow);
    }

    return result;
  }

  createSampleData() {
    return [
      [
        '1',
        'Шашлык',
        'Шашлык свиной',
        'Pork Shashlik',
        'Свињски шашлик',
        'Сочный шашлык из свинины на углях',
        'Juicy pork shashlik grilled on coals',
        'Сочан свињски шашлик печен на роштиљу',
        '100',
        '200г',
        '',
        'TRUE',
        'свинина, специи',
        '450'
      ],
      [
        '2',
        'Люля-кебаб',
        'Люля говяжий',
        'Beef Kebab',
        'Говеђи кебаб',
        'Ароматный кебаб из говядины',
        'Aromatic beef kebab with spices',
        'Ароматичан говеђи кебаб са зачинима',
        '120',
        '180г',
        '',
        'TRUE',
        'говядина, лук, зелень',
        '380'
      ],
      [
        '3',
        'Рыба',
        'Форель гриль',
        'Grilled Trout',
        'Пастрмка са роштиља',
        'Свежая форель на гриле',
        'Fresh grilled trout with herbs',
        'Свежа пастрмка са роштиља са зачинима',
        '150',
        '250г',
        '',
        'TRUE',
        'форель, лимон, травы',
        '280'
      ]
    ];
  }

  async updateSheet(sheets, data) {
    console.log('💾 Обновляем таблицу...');
    
    // Очищаем существующие данные
    await sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `${this.sheetName}!A:Z`,
    });

    // Добавляем новые данные
    await sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${this.sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: data,
      },
    });

    // Форматируем заголовки
    await this.formatHeaders(sheets);
  }

  async formatHeaders(sheets) {
    console.log('🎨 Форматируем заголовки...');
    
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0, // Предполагаем, что Menu - первый лист
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 14,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 0.13,
                      green: 0.22,
                      blue: 0.44,
                    },
                    textFormat: {
                      foregroundColor: {
                        red: 1.0,
                        green: 1.0,
                        blue: 1.0,
                      },
                      fontSize: 12,
                      bold: true,
                    },
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)',
              },
            },
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: 0,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: 14,
                },
              },
            },
          ],
        },
      });
    } catch (error) {
      console.warn('⚠️  Не удалось отформатировать заголовки:', error.message);
    }
  }
}

// Запуск скрипта
if (require.main === module) {
  const setup = new MultilingualMenuSetup();
  setup.init();
}

module.exports = MultilingualMenuSetup;