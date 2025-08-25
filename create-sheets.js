#!/usr/bin/env node

/**
 * Скрипт для создания новой Google Таблицы с правильной структурой
 */

require('dotenv').config();
const { google } = require('./backend/node_modules/googleapis');

async function createDeliverySpreadsheet() {
  try {
    console.log('🚀 Создание новой Google Таблицы для JAN Delivery...\n');

    // Инициализация Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Создание новой таблицы
    const spreadsheet = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: 'JAN Delivery Database'
        },
        sheets: [
          {
            properties: {
              title: 'Menu',
              gridProperties: {
                rowCount: 1000,
                columnCount: 10
              }
            }
          },
          {
            properties: {
              title: 'Orders',
              gridProperties: {
                rowCount: 1000,
                columnCount: 12
              }
            }
          },
          {
            properties: {
              title: 'Users',
              gridProperties: {
                rowCount: 1000,
                columnCount: 9
              }
            }
          }
        ]
      }
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    console.log(`✅ Таблица создана! ID: ${spreadsheetId}`);
    console.log(`📊 URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);

    // Настройка заголовков для листа Menu
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Menu!A1:J1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          'id', 'name', 'description', 'price', 'category', 
          'image', 'available', 'ingredients', 'weight', 'calories'
        ]]
      }
    });

    // Настройка заголовков для листа Orders
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Orders!A1:L1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          'id', 'userId', 'userInfo', 'items', 'total', 'address',
          'coordinates', 'status', 'createdAt', 'estimatedDelivery', 'phone', 'notes'
        ]]
      }
    });

    // Настройка заголовков для листа Users
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Users!A1:I1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[
          'userId', 'first_name', 'last_name', 'username', 'language_code',
          'phone', 'address', 'createdAt', 'updatedAt'
        ]]
      }
    });

    console.log('✅ Заголовки добавлены во все листы');

    // Добавление тестовых данных в Menu
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Menu!A:J',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          ['1', 'Маргарита', 'Классическая пицца с томатами и моцареллой', 450, 'Пицца', '', 'TRUE', 'томатный соус, моцарелла, базилик', '350г', 280],
          ['2', 'Пепперони', 'Пицца с острой салями пепперони', 520, 'Пицца', '', 'TRUE', 'томатный соус, моцарелла, пепперони', '380г', 320],
          ['3', 'Цезарь', 'Салат с курицей и пармезаном', 380, 'Салаты', '', 'TRUE', 'курица, салат, пармезан, соус цезарь', '250г', 220],
          ['4', 'Кола', 'Coca-Cola 0.5л', 120, 'Напитки', '', 'TRUE', '', '0.5л', 210],
          ['5', 'Борщ', 'Украинский борщ со сметаной', 280, 'Супы', '', 'TRUE', 'свекла, капуста, морковь, мясо, сметана', '300г', 180]
        ]
      }
    });

    console.log('✅ Тестовые данные добавлены в Menu');

    // Форматирование таблицы
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          // Заголовки жирным шрифтом
          {
            repeatCell: {
              range: {
                sheetId: 0, // Menu sheet
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true
                  },
                  backgroundColor: {
                    red: 0.9,
                    green: 0.9,
                    blue: 0.9
                  }
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
          },
          {
            repeatCell: {
              range: {
                sheetId: 1, // Orders sheet
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true
                  },
                  backgroundColor: {
                    red: 0.9,
                    green: 0.9,
                    blue: 0.9
                  }
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
          },
          {
            repeatCell: {
              range: {
                sheetId: 2, // Users sheet
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true
                  },
                  backgroundColor: {
                    red: 0.9,
                    green: 0.9,
                    blue: 0.9
                  }
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
          }
        ]
      }
    });

    console.log('✅ Форматирование применено');

    // Настройка доступа (если нужно сделать публичной)
    const drive = google.drive({ version: 'v3', auth });
    await drive.permissions.create({
      fileId: spreadsheetId,
      resource: {
        role: 'writer',
        type: 'anyone'
      }
    });

    console.log('✅ Таблица настроена как публичная (доступ для редактирования)');

    console.log('\n🎉 Готово! Теперь обновите .env файл:');
    console.log(`GOOGLE_SHEETS_ID=${spreadsheetId}`);
    console.log('\nТаблица готова к использованию!');

    return spreadsheetId;

  } catch (error) {
    console.error('❌ Ошибка создания таблицы:', error.message);
    return null;
  }
}

// Запуск если файл выполняется напрямую
if (require.main === module) {
  createDeliverySpreadsheet().catch(error => {
    console.error('Критическая ошибка:', error);
    process.exit(1);
  });
}

module.exports = createDeliverySpreadsheet;