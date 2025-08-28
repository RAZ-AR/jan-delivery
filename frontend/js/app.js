// JAN Delivery - Main Application
class App {
  constructor() {
    this.currentPage = 'menu';
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    utils.log('Инициализация приложения...');

    try {
      // Инициализация i18n
      await window.i18n.init();
      
      // Ждем готовности Telegram WebApp
      await this.waitForTelegram();
      
      // Инициализация элементов
      this.initElements();
      
      // Привязка событий
      this.bindEvents();
      
      // Регистрация пользователя
      await this.registerUser();
      
      // Проверка API
      await this.checkApiHealth();
      
      // Загрузка начальных данных
      await this.loadInitialData();
      
      // Обновление интерфейса
      this.updateUI();
      
      // Скрыть экран загрузки
      this.hideLoadingScreen();
      
      this.isInitialized = true;
      utils.log('Приложение инициализировано');
      
    } catch (error) {
      utils.logError('Ошибка инициализации:', error);
      this.showInitError(error);
    }
  }

  async waitForTelegram() {
    return new Promise((resolve) => {
      if (telegram.isWebAppReady()) {
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if (telegram.isWebAppReady()) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        // Таймаут на 2 секунды для быстрого развертывания в браузере
        setTimeout(() => {
          clearInterval(checkInterval);
          utils.log('Telegram WebApp timeout - продолжаем в режиме отладки');
          // Принудительно активируем mock режим если он еще не активен
          if (!telegram.isWebAppReady()) {
            telegram.mockTelegramForDevelopment();
          }
          resolve();
        }, 2000);
      }
    });
  }

  initElements() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.header = document.getElementById('header');
    this.nav = document.getElementById('nav');
    this.mainContent = document.getElementById('main-content');
    this.userNameSpan = document.getElementById('user-name');
    this.pages = document.querySelectorAll('.page');
    this.navButtons = document.querySelectorAll('.nav-btn');
  }

  bindEvents() {
    // Навигация
    this.nav?.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-btn')) {
        telegram.hapticFeedback('selection');
        this.showPage(e.target.dataset.page);
      }
    });

    // Переключатель языков
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('language-btn')) {
        telegram.hapticFeedback('selection');
        const lang = e.target.dataset.lang;
        if (lang) {
          window.i18n.setLanguage(lang);
        }
      }
    });

    // Слушаем изменения языка для обновления динамического контента
    window.addEventListener('languageChanged', (e) => {
      this.updateDynamicContent(e.detail.language);
    });

    // Обработка ошибок
    window.addEventListener('error', (e) => {
      utils.logError('Глобальная ошибка:', e.error);
    });

    // Обработка необработанных промисов
    window.addEventListener('unhandledrejection', (e) => {
      utils.logError('Необработанный промис:', e.reason);
    });

    // Обработка видимости страницы
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isInitialized) {
        this.onAppVisible();
      }
    });
  }

  async registerUser() {
    const user = telegram.getUser();
    if (!user || !user.id) {
      utils.log('Пользователь не найден или нет ID, пропускаем регистрацию');
      return;
    }

    try {
      await api.createOrUpdateUser({
        userId: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        language_code: user.language_code || 'ru'
      });
      
      const displayName = user.first_name || user.username || `ID: ${user.id}`;
      utils.log('Пользователь зарегистрирован:', displayName);
    } catch (error) {
      utils.logError('Ошибка регистрации пользователя:', error);
    }
  }

  async checkApiHealth() {
    try {
      const isHealthy = await api.checkHealth();
      if (!isHealthy) {
        throw new Error('API недоступен');
      }
      utils.log('API доступен');
    } catch (error) {
      utils.logError('API недоступен:', error);
      utils.showToast('Проблемы с подключением к серверу', 'warning');
    }
  }

  async loadInitialData() {
    // Загружаем данные параллельно
    const promises = [
      menuManager.loadMenu(),
      cart.updateCartDisplay()
    ];

    const user = telegram.getUser();
    if (user) {
      promises.push(ordersManager.loadOrders());
    }

    await Promise.allSettled(promises);
  }

  updateUI() {
    // Обновить информацию о пользователе
    const user = telegram.getUser();
    if (user && this.userNameSpan) {
      const displayName = user.first_name || user.username || `ID: ${user.id}`;
      this.userNameSpan.textContent = displayName;
    }

    // Показать основной интерфейс
    this.showMainInterface();
    
    // Показать начальную страницу
    this.showPage(this.currentPage);
  }

  showMainInterface() {
    if (this.header) this.header.classList.remove('hidden');
    if (this.nav) this.nav.classList.remove('hidden');
    if (this.mainContent) this.mainContent.classList.remove('hidden');
  }

  hideLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.style.opacity = '0';
      setTimeout(() => {
        this.loadingScreen.style.display = 'none';
      }, 300);
    }
  }

  showInitError(error) {
    if (this.loadingScreen) {
      this.loadingScreen.innerHTML = `
        <div style="text-align: center; padding: 24px;">
          <div style="font-size: 64px; margin-bottom: 16px;">😕</div>
          <h3>Ошибка загрузки</h3>
          <p style="color: var(--tg-theme-hint-color); margin-bottom: 24px;">
            ${error.message || 'Что-то пошло не так'}
          </p>
          <button onclick="location.reload()" 
                  style="background: var(--primary-color); color: white; border: none; border-radius: 8px; padding: 12px 24px; cursor: pointer;">
            Попробовать снова
          </button>
        </div>
      `;
    }
  }

  showPage(pageName) {
    if (!pageName) return;

    this.currentPage = pageName;

    // Обновить навигацию
    this.navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageName);
    });

    // Показать нужную страницу
    this.pages.forEach(page => {
      page.classList.toggle('active', page.id === `${pageName}-page`);
    });

    // Выполнить действия при переходе на страницу
    this.onPageShow(pageName);

    utils.log('Переход на страницу:', pageName);
  }

  onPageShow(pageName) {
    switch (pageName) {
      case 'menu':
        // Обновить меню если нужно
        break;
        
      case 'cart':
        // Обновить корзину
        cart.updateCartDisplay();
        break;
        
      case 'orders':
        // Обновить заказы
        if (telegram.getUser()) {
          ordersManager.loadOrders();
          ordersManager.startStatusPolling();
        }
        break;
    }
  }

  onAppVisible() {
    // Обновить данные при возвращении в приложение
    if (this.currentPage === 'orders') {
      ordersManager.refreshOrders();
    }
    
    // Обновить кэш меню если прошло много времени
    const now = Date.now();
    const lastMenuUpdate = localStorage.getItem('last-menu-update');
    if (!lastMenuUpdate || (now - parseInt(lastMenuUpdate)) > CONFIG.CACHE_DURATION) {
      menuManager.refreshMenu();
      localStorage.setItem('last-menu-update', now.toString());
    }
  }

  // Методы для внешнего использования
  getCurrentPage() {
    return this.currentPage;
  }

  isReady() {
    return this.isInitialized;
  }

  // Показать модальное окно (общий метод)
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  // Скрыть модальное окно (общий метод)
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  // Перезагрузить приложение
  async reload() {
    utils.log('Перезагрузка приложения...');
    
    // Очистить кэши
    api.clearCache();
    
    // Остановить polling
    ordersManager.stopStatusPolling();
    
    // Показать загрузку
    this.showMainInterface();
    
    // Перезагрузить данные
    await this.loadInitialData();
    
    // Обновить UI
    this.updateUI();
    
    utils.showToast('Приложение обновлено', 'success');
  }

  // Выход из приложения
  exit() {
    // Остановить polling
    ordersManager.stopStatusPolling();
    
    // Сохранить состояние
    localStorage.setItem('last-visit', Date.now().toString());
    
    // Закрыть приложение
    telegram.close();
  }

  // Обновление динамического контента при смене языка
  async updateDynamicContent(language) {
    console.log(`Обновление контента для языка: ${language}`);

    // Перезагружаем меню с новым языком
    if (window.menuManager) {
      await window.menuManager.loadMenu(language);
      window.menuManager.updateCategoryButtons();
    }

    // Обновляем корзину с новыми названиями
    if (window.cartManager) {
      await window.cartManager.updateItemNames(language);
    }

    // Обновляем заказы с новыми названиями
    if (window.ordersManager) {
      await window.ordersManager.updateOrdersDisplay(language);
    }

    // Обновляем форматирование валют
    const priceElements = document.querySelectorAll('[data-price]');
    priceElements.forEach(el => {
      const price = el.dataset.price;
      if (price) {
        el.textContent = window.i18n.formatCurrency(parseFloat(price));
      }
    });

    // Обновляем форматирование дат
    const dateElements = document.querySelectorAll('[data-date]');
    dateElements.forEach(el => {
      const timestamp = el.dataset.date;
      if (timestamp) {
        const date = new Date(parseInt(timestamp));
        el.textContent = window.i18n.formatDateTime(date);
      }
    });

    // Обновляем placeholder в поисковой строке
    const searchInput = document.querySelector('#search-input');
    if (searchInput) {
      searchInput.placeholder = window.i18n.t('menu.search');
    }

    console.log(`UI обновлен для языка: ${language}`);
  }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Создать глобальный экземпляр приложения
  window.app = new App();
});

// Обработка загрузки всех ресурсов
window.addEventListener('load', () => {
  utils.log('Все ресурсы загружены');
});

// Обработка ошибок загрузки ресурсов
window.addEventListener('error', (e) => {
  if (e.target !== window) {
    utils.logError('Ошибка загрузки ресурса:', e.target.src || e.target.href);
  }
});

// PWA support (для будущего расширения)
if ('serviceWorker' in navigator && CONFIG.DEBUG === false) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        utils.log('Service Worker зарегистрирован:', registration.scope);
      })
      .catch(error => {
        utils.logError('Ошибка регистрации Service Worker:', error);
      });
  });
}