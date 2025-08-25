# 🍕 JAN Delivery - Telegram Mini App

Современное приложение для доставки еды в Telegram с интеграцией Google Sheets как базы данных.

## ✅ СТАТУС ПРОЕКТА - ГОТОВ К РАБОТЕ

**🌐 Live Demo:** https://raz-ar.github.io/jan-delivery/  
**🔗 Backend API:** https://jan-delivery.onrender.com  
**📡 Status:** https://jan-delivery.onrender.com/health

## 🎯 Возможности (Реализовано)

- ✅ **🤖 Telegram Bot** - Полная интеграция с Telegram API
- ✅ **📱 Mini App** - Нативное Telegram приложение
- ✅ **📊 Google Sheets DB** - Простое управление данными 
- ✅ **🎨 Кастомный дизайн** - Цветовая схема #223971
- ✅ **🖼️ SVG Логотип** - Поддержка кастомного логотипа
- ✅ **🗺️ Геолокация** - Автоматическое определение адреса
- ✅ **📦 Корзина** - Удобное оформление заказов
- ✅ **🔔 Уведомления** - Отслеживание статуса заказа
- ✅ **📊 API документация** - Полный набор endpoints
- ✅ **🚀 Production Ready** - Развернуто на Render.com

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram      │    │    Backend      │    │  Google Sheets  │
│   Mini App      │◄──►│   Node.js API   │◄──►│   Database      │
│   (Frontend)    │    │   Express.js    │    │   (Menu, Orders)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │ OpenRouteService│              │
         └──────────────►│   Geocoding     │◄─────────────┘
                        └─────────────────┘
```

## 🚀 Как использовать (ГОТОВО)

### Проект уже развернут и работает!

1. **🌐 Web версия:** https://raz-ar.github.io/jan-delivery/
2. **📱 Telegram Bot:** Найдите бота в Telegram и нажмите "Открыть меню"
3. **⚙️ Админка:** Управляйте меню через Google Sheets
4. **📊 Мониторинг:** https://jan-delivery.onrender.com/health

### 🔧 Локальная разработка (если нужно)

1. **Клонирование:**
```bash
git clone https://github.com/RAZ-AR/jan-delivery.git
cd jan-delivery
```

2. **Backend:**
```bash
cd backend
npm install
npm run dev
```

3. **Frontend:**
Откройте `frontend/index.html` в браузере

### 🖼️ Добавить логотип

Поместите файл `logo.svg` в папку `frontend/assets/images/` - логотип появится автоматически!

## 📋 Настройка

### Google Sheets API
1. Следуйте [руководству по настройке Google Sheets](docs/setup/google-sheets-setup.md)
2. Создайте таблицу со структурой из [документации](docs/google-sheets/)
3. Заполните тестовыми данными из [примеров](docs/google-sheets/sample-data.md)

### Telegram Bot
1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен и добавьте в `.env`
3. Настройте Mini App в BotFather

### OpenRouteService
1. Зарегистрируйтесь на [OpenRouteService](https://openrouteservice.org/)
2. Получите API ключ
3. Добавьте в `.env`

## 🗂️ Структура проекта

```
jan-delivery/
├── backend/                 # API сервер
│   ├── src/
│   │   ├── app.js          # Главный файл сервера
│   │   ├── routes/         # API маршруты
│   │   ├── controllers/    # Бизнес логика
│   │   ├── services/       # Внешние сервисы
│   │   └── middleware/     # Промежуточные обработчики
│   └── package.json
├── frontend/               # Telegram Mini App
│   ├── index.html         # Главная страница
│   ├── js/                # JavaScript модули
│   └── styles/            # CSS стили
├── docs/                  # Документация
│   ├── google-sheets/     # Структура БД
│   └── setup/             # Руководства по настройке
└── scripts/               # Утилиты и тесты
```

## 🛠️ API Endpoints

### Меню
- `GET /api/menu` - Получить все блюда
- `GET /api/menu/:id` - Получить блюдо по ID
- `GET /api/menu/category/:category` - Получить блюда по категории

### Заказы
- `POST /api/orders` - Создать заказ
- `GET /api/orders/user/:userId` - Заказы пользователя
- `GET /api/orders/:orderId` - Получить заказ по ID
- `PUT /api/orders/:orderId/status` - Обновить статус

### Пользователи
- `POST /api/users` - Создать/обновить пользователя
- `GET /api/users/:userId` - Получить пользователя
- `PUT /api/users/:userId/address` - Обновить адрес

### Система
- `GET /health` - Проверка работоспособности
- `POST /webhook` - Telegram webhook

## 🗃️ База данных (Google Sheets)

### Лист "Menu"
Содержит каталог блюд:
- id, name, description, price, category
- image, available, ingredients, weight, calories

### Лист "Orders"  
Содержит все заказы:
- id, userId, userInfo, items, total, address
- coordinates, status, createdAt, phone, notes

### Лист "Users"
Содержит профили пользователей:
- userId, first_name, last_name, username
- language_code, phone, address, createdAt, updatedAt

## 📱 Telegram Mini App

### Страницы
- **🍽️ Меню** - Каталог с категориями и поиском
- **🛒 Корзина** - Управление заказом
- **📦 Заказы** - История и отслеживание

### Функции
- Автоматическое определение пользователя
- Геолокация и адрес доставки
- Haptic feedback для лучшего UX
- Кэширование для быстрой работы
- Адаптивный дизайн под Telegram тему

## 🚢 Деплой (УЖЕ РАЗВЕРНУТО)

### ✅ Текущая конфигурация
- **Backend:** Развернут на Render.com - https://jan-delivery.onrender.com
- **Frontend:** GitHub Pages - https://raz-ar.github.io/jan-delivery/
- **Database:** Google Sheets (настроен)
- **Telegram Webhook:** Активен и работает

### 🔄 Автоматические обновления
- **Frontend:** Обновляется автоматически при push в `main` ветку
- **Backend:** Перезапускается при изменениях в коде на GitHub
- **Database:** Обновления в Google Sheets отображаются мгновенно

### 📋 Если нужно развернуть свою копию
1. Fork этого репозитория
2. Следуйте [FIX_BACKEND_DEPLOYMENT.md](FIX_BACKEND_DEPLOYMENT.md)
3. Настройте свои переменные окружения

## 🧪 Тестирование (РАБОТАЕТ)

### ✅ Live тесты
```bash
# Проверка статуса
curl https://jan-delivery.onrender.com/health

# Проверка меню API
curl https://jan-delivery.onrender.com/api/menu
```

### 📱 Telegram тест
1. Найдите бота в Telegram
2. Отправьте `/start`
3. Нажмите "🍽️ Открыть меню"
4. Добавьте блюда в корзину
5. Оформите тестовый заказ

### 🌐 Web тест
1. Откройте https://raz-ar.github.io/jan-delivery/
2. Меню загружается из Google Sheets
3. Все функции работают

## 🔧 Разработка

### Локальная разработка
```bash
# Запуск backend в dev режиме
cd backend
npm run dev

# Открыть frontend для тестирования
open frontend/index.html
```

### Структура кода
- **Backend**: Express.js с модульной архитектурой
- **Frontend**: Vanilla JS с классами и модулями
- **Стили**: CSS3 с CSS переменными
- **API**: RESTful с JSON responses

## 📊 Мониторинг

### Логи
- Backend логи в консоль и файлы
- Frontend логи в browser console
- Telegram webhook логи

### Метрики
- Количество заказов
- Популярные блюда
- География пользователей
- Время ответа API

## 🔐 Безопасность

- Валидация всех входящих данных
- Защита API endpoints
- Безопасное хранение ключей
- Rate limiting для API
- CORS настройки

## 🤝 Участие в разработке

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Создайте Pull Request

### Стандарты кода
- ESLint для JavaScript
- Prettier для форматирования
- Комментарии на русском языке
- Semantic commit messages

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл.

## 📞 Поддержка

- 📚 [Документация](docs/)
- 🐛 [Issues](https://github.com/RAZ-AR/jan-delivery/issues)
- 💬 [Discussions](https://github.com/RAZ-AR/jan-delivery/discussions)
- 🚀 [Deployment Guide](FIX_BACKEND_DEPLOYMENT.md)

## 🎉 Благодарности

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [OpenRouteService](https://openrouteservice.org/)
- [Render.com](https://render.com/)

---

## 🎯 РЕЗЮМЕ

**JAN Delivery - это полнофункциональный Telegram Mini App для доставки еды, который:**

- ✅ **Работает прямо сейчас** - https://raz-ar.github.io/jan-delivery/
- ✅ **Развернут в production** - Backend на Render.com
- ✅ **Подключен к Google Sheets** - Управление меню и заказами
- ✅ **Имеет кастомный дизайн** - Цвет #223971, поддержка SVG логотипа  
- ✅ **Готов к использованию** - Добавьте логотип и начинайте принимать заказы!

**Создано с ❤️ для сообщества разработчиков**
