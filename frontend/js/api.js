// JAN Delivery - API Service
class ApiService {
  constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
    this.cache = new Map();
  }

  // Базовый метод для HTTP запросов
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    // Добавить данные пользователя Telegram в заголовки
    const user = telegram.getUser();
    if (user) {
      defaultOptions.headers['X-Telegram-User-Id'] = user.id;
      defaultOptions.headers['X-Telegram-Init-Data'] = telegram.getInitData();
    }

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      utils.log('API Request:', url, finalOptions);
      
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      utils.log('API Response:', data);
      
      return data;
    } catch (error) {
      utils.logError('API Error:', error);
      throw error;
    }
  }

  // GET запрос с кэшированием
  async get(endpoint, useCache = true) {
    const cacheKey = `GET:${endpoint}`;
    
    // Проверить кэш
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
        utils.log('Данные из кэша:', endpoint);
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    const data = await this.request(endpoint, { method: 'GET' });
    
    // Сохранить в кэш
    if (useCache) {
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    }

    return data;
  }

  // POST запрос
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  // PUT запрос
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  // DELETE запрос
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Очистить кэш
  clearCache() {
    this.cache.clear();
    utils.log('Кэш API очищен');
  }

  // Методы для работы с конкретными API

  // Получить меню
  async getMenu() {
    try {
      const response = await this.get(CONFIG.ENDPOINTS.MENU);
      return response.success ? response.data : [];
    } catch (error) {
      utils.logError('Ошибка загрузки меню:', error);
      return [];
    }
  }

  // Получить блюдо по ID
  async getMenuItem(id) {
    try {
      const response = await this.get(`${CONFIG.ENDPOINTS.MENU}/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      utils.logError('Ошибка загрузки блюда:', error);
      return null;
    }
  }

  // Получить меню по категории
  async getMenuByCategory(category) {
    try {
      const response = await this.get(`${CONFIG.ENDPOINTS.MENU}/category/${category}`);
      return response.success ? response.data : [];
    } catch (error) {
      utils.logError('Ошибка загрузки категории:', error);
      return [];
    }
  }

  // Создать заказ
  async createOrder(orderData) {
    try {
      const response = await this.post(CONFIG.ENDPOINTS.CREATE_ORDER, orderData);
      if (response.success) {
        utils.showToast('Заказ успешно создан!', 'success');
        return response.data;
      } else {
        throw new Error(response.error || 'Не удалось создать заказ');
      }
    } catch (error) {
      utils.logError('Ошибка создания заказа:', error);
      utils.showToast('Ошибка создания заказа', 'error');
      throw error;
    }
  }

  // Получить заказы пользователя
  async getUserOrders(userId) {
    try {
      const response = await this.get(`${CONFIG.ENDPOINTS.ORDERS}/user/${userId}`, false);
      return response.success ? response.data : [];
    } catch (error) {
      utils.logError('Ошибка загрузки заказов:', error);
      return [];
    }
  }

  // Получить заказ по ID
  async getOrder(orderId) {
    try {
      const response = await this.get(`${CONFIG.ENDPOINTS.ORDERS}/${orderId}`, false);
      return response.success ? response.data : null;
    } catch (error) {
      utils.logError('Ошибка загрузки заказа:', error);
      return null;
    }
  }

  // Создать или обновить пользователя
  async createOrUpdateUser(userData) {
    try {
      const response = await this.post(CONFIG.ENDPOINTS.USERS, userData);
      return response.success ? response.data : null;
    } catch (error) {
      utils.logError('Ошибка создания пользователя:', error);
      return null;
    }
  }

  // Получить пользователя
  async getUser(userId) {
    try {
      const response = await this.get(`${CONFIG.ENDPOINTS.USERS}/${userId}`);
      return response.success ? response.data : null;
    } catch (error) {
      utils.logError('Ошибка загрузки пользователя:', error);
      return null;
    }
  }

  // Обновить адрес пользователя
  async updateUserAddress(userId, address) {
    try {
      const response = await this.put(`${CONFIG.ENDPOINTS.USERS}/${userId}/address`, { address });
      return response.success ? response.data : null;
    } catch (error) {
      utils.logError('Ошибка обновления адреса:', error);
      return null;
    }
  }

  // Проверить статус API
  async checkHealth() {
    try {
      const response = await this.get(CONFIG.ENDPOINTS.HEALTH, false);
      return response.status === 'OK';
    } catch (error) {
      utils.logError('API недоступен:', error);
      return false;
    }
  }

  // Геокодирование (если добавить endpoint)
  async geocodeAddress(address) {
    try {
      const response = await this.post(CONFIG.ENDPOINTS.GEOCODE, { address });
      return response.success ? response.data : null;
    } catch (error) {
      utils.logError('Ошибка геокодирования:', error);
      return null;
    }
  }

  // Проверка зоны доставки
  async checkDeliveryZone({ address, latitude, longitude }) {
    try {
      const payload = address ? { address } : { latitude, longitude };
      const response = await this.post(CONFIG.ENDPOINTS.CHECK_ZONE, payload);
      return response.success ? response.data?.inZone : false;
    } catch (error) {
      utils.logError('Ошибка проверки зоны доставки:', error);
      return false;
    }
  }

  // Добавить в список ожидания
  async addToWaitlist(payload) {
    try {
      const response = await this.post(CONFIG.ENDPOINTS.WAITLIST, payload);
      return !!response.success;
    } catch (error) {
      utils.logError('Ошибка добавления в список ожидания:', error);
      return false;
    }
  }
}

// Создать глобальный экземпляр
const api = new ApiService();
