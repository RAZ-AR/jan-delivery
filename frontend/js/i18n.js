// JAN Delivery - Internationalization (i18n) System
// Система интернационализации для поддержки русского, английского и сербского языков

class I18n {
    constructor() {
        this.currentLanguage = 'ru'; // По умолчанию русский
        this.translations = {};
        this.supportedLanguages = ['ru', 'en', 'sr'];
        this.defaultLanguage = 'ru';
    }

    // Загрузка переводов
    async loadTranslations() {
        try {
            const translations = await Promise.all([
                fetch('./js/translations/ru.json').then(r => r.json()),
                fetch('./js/translations/en.json').then(r => r.json()),
                fetch('./js/translations/sr.json').then(r => r.json())
            ]);

            this.translations = {
                ru: translations[0],
                en: translations[1],
                sr: translations[2]
            };

            console.log('Translations loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load translations:', error);
            return false;
        }
    }

    // Установка языка
    setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Language '${lang}' not supported, falling back to '${this.defaultLanguage}'`);
            lang = this.defaultLanguage;
        }
        
        this.currentLanguage = lang;
        localStorage.setItem('jan-delivery-language', lang);
        
        // Очищаем кэш API при смене языка
        if (window.api) {
            window.api.clearCache();
        }
        
        this.updateUI();
        
        // Уведомляем об изменении языка
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    // Получение языка (с приоритетом: localStorage -> Telegram -> default)
    getLanguage() {
        // 1. Проверяем localStorage
        const saved = localStorage.getItem('jan-delivery-language');
        if (saved && this.supportedLanguages.includes(saved)) {
            return saved;
        }

        // 2. Проверяем Telegram language_code
        if (window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code) {
            const telegramLang = window.Telegram.WebApp.initDataUnsafe.user.language_code;
            
            // Маппинг Telegram language codes
            const langMapping = {
                'ru': 'ru',
                'en': 'en', 
                'sr': 'sr',
                'rs': 'sr', // Serbian alternative
                'sr-Latn': 'sr',
                'sr-Cyrl': 'sr'
            };

            const mappedLang = langMapping[telegramLang];
            if (mappedLang && this.supportedLanguages.includes(mappedLang)) {
                return mappedLang;
            }
        }

        // 3. По умолчанию
        return this.defaultLanguage;
    }

    // Инициализация с определением языка
    async init() {
        await this.loadTranslations();
        const detectedLang = this.getLanguage();
        this.setLanguage(detectedLang);
    }

    // Получение перевода по ключу
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        // Навигация по вложенным ключам
        for (const k of keys) {
            value = value?.[k];
        }

        // Если перевод не найден, пробуем на языке по умолчанию
        if (value === undefined) {
            value = this.translations[this.defaultLanguage];
            for (const k of keys) {
                value = value?.[k];
            }
        }

        // Если все еще не найден, возвращаем ключ
        if (value === undefined) {
            console.warn(`Translation not found for key: ${key}`);
            return key;
        }

        // Подстановка параметров
        return this.interpolate(value, params);
    }

    // Подстановка параметров в строку
    interpolate(str, params) {
        return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    // Обновление UI после изменения языка
    updateUI() {
        // Обновляем все элементы с data-i18n атрибутом
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // Обновляем placeholder'ы
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // Обновляем title атрибуты
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // Обновляем document title
        document.title = this.t('app.title');

        // Обновляем активную кнопку языка
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === this.currentLanguage) {
                btn.classList.add('active');
            }
        });
    }

    // Получение текущего языка
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Получение всех поддерживаемых языков
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    // Получение названия языка
    getLanguageName(lang) {
        const names = {
            'ru': 'Русский',
            'en': 'English', 
            'sr': 'Српски'
        };
        return names[lang] || lang;
    }

    // Форматирование валюты
    formatCurrency(amount) {
        const formats = {
            'ru': { symbol: '₽', position: 'after' },
            'en': { symbol: '$', position: 'before' },
            'sr': { symbol: 'din', position: 'after' }
        };

        const format = formats[this.currentLanguage] || formats['ru'];
        
        if (format.position === 'before') {
            return `${format.symbol}${amount}`;
        } else {
            return `${amount} ${format.symbol}`;
        }
    }

    // Форматирование даты и времени
    formatDateTime(date) {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        const locales = {
            'ru': 'ru-RU',
            'en': 'en-US',
            'sr': 'sr-RS'
        };

        return new Intl.DateTimeFormat(
            locales[this.currentLanguage] || locales['ru'], 
            options
        ).format(date);
    }
}

// Создаем глобальный экземпляр
window.i18n = new I18n();

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}