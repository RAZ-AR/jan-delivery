const { google } = require('googleapis');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    this.initService();
  }

  initService() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.warn('⚠️ Google Sheets credentials не установлены');
      return;
    }

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      console.log('✅ Google Sheets сервис инициализирован');
    } catch (error) {
      console.error('❌ Ошибка инициализации Google Sheets:', error);
    }
  }

  // Получить данные из листа
  async getSheetData(sheetName, range = 'A:Z') {
    if (!this.sheets) {
      throw new Error('Google Sheets сервис не инициализирован');
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!${range}`
      });

      return response.data.values || [];
    } catch (error) {
      console.error(`Ошибка получения данных из ${sheetName}:`, error);
      throw error;
    }
  }

  // Добавить строку в лист
  async appendToSheet(sheetName, values) {
    if (!this.sheets) {
      throw new Error('Google Sheets сервис не инициализирован');
    }

    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [values]
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Ошибка добавления в ${sheetName}:`, error);
      throw error;
    }
  }

  // Обновить строку в листе
  async updateSheetRow(sheetName, row, values) {
    if (!this.sheets) {
      throw new Error('Google Sheets сервис не инициализирован');
    }

    try {
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${row}:Z${row}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [values]
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Ошибка обновления ${sheetName} строка ${row}:`, error);
      throw error;
    }
  }

  // Найти строку по значению в колонке
  async findRowByValue(sheetName, searchColumn, searchValue) {
    const data = await this.getSheetData(sheetName);
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][searchColumn] === searchValue) {
        return { row: i + 1, data: data[i] };
      }
    }
    
    return null;
  }
}

module.exports = new GoogleSheetsService();