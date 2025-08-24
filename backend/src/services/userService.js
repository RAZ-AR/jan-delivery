const googleSheetsService = require('./googleSheetsService');

class UserService {
  constructor() {
    this.sheetName = 'Users';
  }

  // Создать или обновить пользователя
  async createOrUpdateUser(userData) {
    try {
      const existingUser = await this.getUserById(userData.userId);
      
      const user = {
        userId: userData.userId,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        username: userData.username || '',
        language_code: userData.language_code || 'ru',
        phone: userData.phone || '',
        address: userData.address || '',
        createdAt: existingUser ? existingUser.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingUser) {
        // Обновить существующего пользователя
        await this.updateUser(user);
      } else {
        // Создать нового пользователя
        await this.createUser(user);
      }

      return user;
    } catch (error) {
      console.error('Ошибка создания/обновления пользователя:', error);
      throw error;
    }
  }

  // Создать нового пользователя
  async createUser(userData) {
    const values = [
      userData.userId,
      userData.first_name,
      userData.last_name,
      userData.username,
      userData.language_code,
      userData.phone,
      userData.address,
      userData.createdAt,
      userData.updatedAt
    ];

    await googleSheetsService.appendToSheet(this.sheetName, values);
    return userData;
  }

  // Обновить пользователя
  async updateUser(userData) {
    const result = await googleSheetsService.findRowByValue(this.sheetName, 0, userData.userId);
    
    if (!result) {
      throw new Error('Пользователь не найден');
    }

    const values = [
      userData.userId,
      userData.first_name,
      userData.last_name,
      userData.username,
      userData.language_code,
      userData.phone,
      userData.address,
      result.data[7], // Сохранить createdAt
      userData.updatedAt
    ];

    await googleSheetsService.updateSheetRow(this.sheetName, result.row, values);
    return userData;
  }

  // Получить пользователя по ID
  async getUserById(userId) {
    try {
      const result = await googleSheetsService.findRowByValue(this.sheetName, 0, userId);
      return result ? this.parseUserFromRow(result.data) : null;
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      return null;
    }
  }

  // Обновить адрес пользователя
  async updateUserAddress(userId, address) {
    try {
      const user = await this.getUserById(userId);
      
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      user.address = address;
      user.updatedAt = new Date().toISOString();

      await this.updateUser(user);
      return user;
    } catch (error) {
      console.error('Ошибка обновления адреса:', error);
      throw error;
    }
  }

  // Парсинг строки пользователя
  parseUserFromRow(row) {
    return {
      userId: row[0] || '',
      first_name: row[1] || '',
      last_name: row[2] || '',
      username: row[3] || '',
      language_code: row[4] || 'ru',
      phone: row[5] || '',
      address: row[6] || '',
      createdAt: row[7] || '',
      updatedAt: row[8] || ''
    };
  }
}

module.exports = new UserService();