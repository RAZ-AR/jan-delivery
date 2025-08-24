// JAN Delivery - Telegram WebApp Integration
class TelegramWebApp {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.user = null;
    this.isReady = false;
    
    this.init();
  }

  init() {
    if (!this.tg) {
      utils.logError('Telegram WebApp не найден');
      // Fallback для тестирования вне Telegram
      this.mockTelegramForDevelopment();
      return;
    }

    try {
      // Инициализация WebApp
      this.tg.ready();
      this.tg.expand();
      
      // Применить тему
      this.applyTheme();
      
      // Получить данные пользователя
      this.user = this.tg.initDataUnsafe?.user;
      
      // Настроить кнопки
      this.setupButtons();
      
      // Настроить события
      this.setupEvents();
      
      this.isReady = true;
      utils.log('Telegram WebApp инициализирован', this.user);
      
    } catch (error) {
      utils.logError('Ошибка инициализации Telegram WebApp:', error);
      this.mockTelegramForDevelopment();
    }
  }

  mockTelegramForDevelopment() {
    if (CONFIG.DEBUG) {
      utils.log('Режим разработки: создание mock Telegram WebApp');
      
      this.user = {
        id: 123456789,
        first_name: 'Тест',
        last_name: 'Пользователь',
        username: 'testuser',
        language_code: 'ru'
      };
      
      this.tg = {
        ready: () => {},
        expand: () => {},
        close: () => window.close(),
        MainButton: {
          text: '',
          show: () => {},
          hide: () => {},
          enable: () => {},
          disable: () => {},
          setText: (text) => { this.tg.MainButton.text = text; },
          onClick: (callback) => { this.tg.MainButton.callback = callback; },
          offClick: () => {},
          showProgress: () => {},
          hideProgress: () => {}
        },
        BackButton: {
          show: () => {},
          hide: () => {},
          onClick: (callback) => { this.tg.BackButton.callback = callback; },
          offClick: () => {}
        },
        HapticFeedback: {
          impactOccurred: (style) => {},
          notificationOccurred: (type) => {},
          selectionChanged: () => {}
        },
        showPopup: (params, callback) => {
          const result = confirm(params.message);
          if (callback) callback(result ? 'ok' : 'cancel');
        },
        showAlert: (message, callback) => {
          alert(message);
          if (callback) callback();
        },
        showConfirm: (message, callback) => {
          const result = confirm(message);
          if (callback) callback(result);
        }
      };
      
      this.isReady = true;
    }
  }

  applyTheme() {
    if (!this.tg?.themeParams) return;

    const root = document.documentElement;
    const theme = this.tg.themeParams;

    // Применить цвета темы Telegram
    if (theme.bg_color) root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
    if (theme.text_color) root.style.setProperty('--tg-theme-text-color', theme.text_color);
    if (theme.hint_color) root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
    if (theme.link_color) root.style.setProperty('--tg-theme-link-color', theme.link_color);
    if (theme.button_color) root.style.setProperty('--tg-theme-button-color', theme.button_color);
    if (theme.button_text_color) root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
    if (theme.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);

    utils.log('Тема Telegram применена', theme);
  }

  setupButtons() {
    if (!this.tg) return;

    // Скрыть основную кнопку по умолчанию
    this.hideMainButton();
    
    // Скрыть кнопку назад по умолчанию
    this.hideBackButton();
  }

  setupEvents() {
    if (!this.tg) return;

    // Обработка закрытия приложения
    this.tg.onEvent('viewportChanged', () => {
      utils.log('Viewport изменен');
    });
  }

  // Методы для работы с основной кнопкой
  showMainButton(text, callback) {
    if (!this.tg?.MainButton) return;

    this.tg.MainButton.setText(text);
    this.tg.MainButton.onClick(callback);
    this.tg.MainButton.show();
    this.tg.MainButton.enable();
  }

  hideMainButton() {
    if (!this.tg?.MainButton) return;
    
    this.tg.MainButton.hide();
    this.tg.MainButton.offClick();
  }

  setMainButtonLoading(loading = true) {
    if (!this.tg?.MainButton) return;

    if (loading) {
      this.tg.MainButton.showProgress();
      this.tg.MainButton.disable();
    } else {
      this.tg.MainButton.hideProgress();
      this.tg.MainButton.enable();
    }
  }

  // Методы для работы с кнопкой назад
  showBackButton(callback) {
    if (!this.tg?.BackButton) return;

    this.tg.BackButton.onClick(callback);
    this.tg.BackButton.show();
  }

  hideBackButton() {
    if (!this.tg?.BackButton) return;
    
    this.tg.BackButton.hide();
    this.tg.BackButton.offClick();
  }

  // Методы для хаптик обратной связи
  hapticFeedback(type = 'medium') {
    if (!this.tg?.HapticFeedback) return;

    switch (type) {
      case 'light':
      case 'medium':
      case 'heavy':
        this.tg.HapticFeedback.impactOccurred(type);
        break;
      case 'error':
      case 'success':
      case 'warning':
        this.tg.HapticFeedback.notificationOccurred(type);
        break;
      case 'selection':
        this.tg.HapticFeedback.selectionChanged();
        break;
    }
  }

  // Методы для показа уведомлений
  showAlert(message, callback) {
    if (!this.tg) {
      alert(message);
      if (callback) callback();
      return;
    }

    this.tg.showAlert(message, callback);
  }

  showConfirm(message, callback) {
    if (!this.tg) {
      const result = confirm(message);
      if (callback) callback(result);
      return;
    }

    this.tg.showConfirm(message, callback);
  }

  showPopup(params, callback) {
    if (!this.tg) {
      const result = confirm(params.message);
      if (callback) callback(result ? 'ok' : 'cancel');
      return;
    }

    this.tg.showPopup(params, callback);
  }

  // Отправка данных в бот
  sendData(data) {
    if (!this.tg) {
      utils.log('Отправка данных (dev mode):', data);
      return;
    }

    try {
      this.tg.sendData(JSON.stringify(data));
    } catch (error) {
      utils.logError('Ошибка отправки данных:', error);
    }
  }

  // Закрыть приложение
  close() {
    if (!this.tg) {
      window.close();
      return;
    }

    this.tg.close();
  }

  // Получить данные пользователя
  getUser() {
    return this.user;
  }

  // Проверить, готов ли WebApp
  isWebAppReady() {
    return this.isReady;
  }

  // Получить язык пользователя
  getUserLanguage() {
    return this.user?.language_code || 'ru';
  }

  // Получить инициализационные данные
  getInitData() {
    return this.tg?.initData || '';
  }
}

// Создать глобальный экземпляр
const telegram = new TelegramWebApp();