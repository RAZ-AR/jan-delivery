# 🍕 JAN Delivery - Telegram Mini App

Современное приложение для доставки еды в Telegram с интеграцией Google Sheets как базы данных.

## 🎯 Возможности

- **🤖 Telegram Bot** - Полная интеграция с Telegram API
- **📱 Mini App** - Нативное Telegram приложение
- **📊 Google Sheets DB** - Простое управление данными
- **🗺️ Геолокация** - Автоматическое определение адреса
- **🔔 Уведомления** - Отслеживание статуса заказа
- **📦 Корзина** - Удобное оформление заказов
- **📈 Аналитика** - Встроенная отчетность

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

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/yourusername/jan-delivery.git
cd jan-delivery
```

### 2. Установка зависимостей
```bash
cd backend
npm install
```

### 3. Настройка окружения
```bash
cp .env.example .env
# Отредактируйте .env файл с вашими ключами
```

### 4. Запуск разработки
```bash
npm run dev
```

### 5. Открытие frontend
Откройте `frontend/index.html` в браузере для тестирования.

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

## 🚢 Деплой

### Render.com (рекомендуется)
1. Следуйте [руководству по деплою](docs/setup/deployment-guide.md)
2. Создайте Web Service для backend
3. Создайте Static Site для frontend
4. Настройте переменные окружения

### Быстрый старт (Render + GitHub Pages)
- Репозиторий: запушьте код в GitHub (ветка `main`).
- Render Blueprint: в корне есть `render.yaml` — в Render → New → Blueprint выберите репозиторий и создайте ресурсы (backend + static frontend).
- Переменные окружения backend: задайте `TELEGRAM_BOT_TOKEN`, `GOOGLE_*`, `OPENROUTE_API_KEY`, `WEB_APP_URL`, `TELEGRAM_WEBHOOK_URL`.
- Проверка: `https://<backend-url>/health` должен возвращать OK.
- Frontend: GitHub Pages воркфлоу (`.github/workflows/deploy-frontend.yml`) публикует папку `frontend/`.
- API URL: в `frontend/index.html` мета‑тег `<meta name="jan-api-base" content="...">` укажите на URL вашего backend.

### Другие платформы
- **Heroku** - для backend
- **Vercel/Netlify** - для frontend  
- **Railway** - full-stack решение

## 🧪 Тестирование

### Тест Google Sheets подключения
```bash
node scripts/test-sheets.js
```

### Проверка API
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/menu
```

### Тест в Telegram
1. Добавьте бота в Telegram
2. Отправьте `/start`
3. Нажмите "🍽️ Открыть меню"

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
- 🐛 [Issues](https://github.com/yourusername/jan-delivery/issues)
- 💬 [Discussions](https://github.com/yourusername/jan-delivery/discussions)

## 🎉 Благодарности

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [OpenRouteService](https://openrouteservice.org/)
- [Render.com](https://render.com/)

---

**Создано с ❤️ для сообщества разработчиков**
