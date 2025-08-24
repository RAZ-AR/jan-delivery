# Руководство по деплою JAN Delivery

## Обзор
Это руководство поможет развернуть JAN Delivery на Render.com с интеграцией Telegram Bot, Google Sheets и OpenRouteService API.

## Предварительные требования

### Необходимые аккаунты
- [Render.com](https://render.com) - для хостинга
- [Google Cloud](https://console.cloud.google.com) - для Google Sheets API
- [OpenRouteService](https://openrouteservice.org) - для геокодирования
- [Telegram](https://t.me/BotFather) - для создания бота

### Необходимые данные
- Готовая Google Sheets таблица с данными
- Telegram Bot Token
- OpenRouteService API Key
- GitHub репозиторий с кодом

## Шаг 1: Настройка репозитория

### 1.1 Создайте GitHub репозиторий
```bash
git init
git add .
git commit -m "Initial commit: JAN Delivery v1.0"
git branch -M main
git remote add origin https://github.com/yourusername/jan-delivery.git
git push -u origin main
```

### 1.2 Убедитесь в правильной структуре
```
jan-delivery/
├── backend/
│   ├── src/
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── index.html
│   ├── js/
│   └── styles/
├── docs/
├── scripts/
└── .env.example
```

## Шаг 2: Создание Telegram Bot

### 2.1 Создайте бота
1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Введите название: `JAN Delivery Bot`
4. Введите username: `jan_delivery_bot` (должен быть уникальным)
5. Сохраните полученный токен

### 2.2 Настройте Mini App
1. Отправьте `/newapp` в BotFather
2. Выберите созданного бота
3. Введите название: `JAN Delivery`
4. Введите описание: `Доставка еды через Telegram`
5. Загрузите иконку 640x360px
6. Введите URL приложения: `https://your-frontend-url.onrender.com`

### 2.3 Настройте команды бота
Отправьте `/setcommands` в BotFather и введите:
```
start - Запустить бота и открыть меню
menu - Открыть меню ресторана
help - Показать справку
```

## Шаг 3: Получение OpenRouteService API Key

### 3.1 Регистрация
1. Перейдите на https://openrouteservice.org/
2. Нажмите "Sign Up"
3. Подтвердите email

### 3.2 Создание API ключа
1. Войдите в панель управления
2. Перейдите в "Dashboard"
3. Нажмите "Request a Token"
4. Выберите "Free" план (5000 запросов/день)
5. Сохраните полученный API ключ

## Шаг 4: Деплой Backend на Render.com

### 4.1 Создайте аккаунт на Render.com
1. Перейдите на https://render.com
2. Зарегистрируйтесь через GitHub

### 4.2 Создайте Web Service
1. Нажмите "New" → "Web Service"
2. Подключите GitHub репозиторий
3. Настройте параметры:
   - **Name**: `jan-delivery-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `/` (оставить пустым)

### 4.3 Настройте переменные окружения
В разделе "Environment Variables" добавьте:

```env
NODE_ENV=production
PORT=3000

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://jan-delivery-backend.onrender.com
TELEGRAM_BOT_USERNAME=jan_delivery_bot

# Google Sheets API
GOOGLE_SHEETS_ID=1A2B3C4D5E6F7G8H9I0J
GOOGLE_SERVICE_ACCOUNT_EMAIL=jan-delivery-bot@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nВАШ_КЛЮЧ_ЗДЕСЬ\n-----END PRIVATE KEY-----

# OpenRouteService API
OPENROUTE_API_KEY=your_openroute_api_key

# Frontend URL
WEB_APP_URL=https://jan-delivery-frontend.onrender.com
```

⚠️ **Важно**: 
- Замените все значения на реальные
- Private key должен быть в одну строку с `\n`
- URL будут доступны после создания сервисов

### 4.4 Разверните backend
1. Нажмите "Create Web Service"
2. Дождитесь завершения деплоя
3. Скопируйте URL (например: https://jan-delivery-backend.onrender.com)

## Шаг 5: Деплой Frontend на Render.com

### 5.1 Создайте Static Site
1. Нажмите "New" → "Static Site"
2. Выберите тот же GitHub репозиторий
3. Настройте параметры:
   - **Name**: `jan-delivery-frontend`
   - **Build Command**: `echo "No build needed"`
   - **Publish Directory**: `frontend`

### 5.2 Обновите конфигурацию frontend
Отредактируйте `frontend/js/config.js`:
```javascript
const CONFIG = {
  // Замените на URL вашего backend
  API_BASE_URL: 'https://jan-delivery-backend.onrender.com',
  // ... остальная конфигурация
};
```

### 5.3 Разверните frontend
1. Нажмите "Create Static Site"
2. Дождитесь завершения деплоя
3. Скопируйте URL (например: https://jan-delivery-frontend.onrender.com)

## Шаг 6: Настройка Telegram Webhook

### 6.1 Обновите переменные окружения backend
В Render.com обновите переменные:
- `WEB_APP_URL`: URL вашего frontend
- `TELEGRAM_WEBHOOK_URL`: URL вашего backend

### 6.2 Обновите Mini App URL в BotFather
1. Отправьте `/editapp` в BotFather
2. Выберите ваше приложение
3. Выберите "Edit URL"
4. Введите URL frontend: `https://jan-delivery-frontend.onrender.com`

### 6.3 Установите webhook (автоматически)
При запуске backend автоматически установит webhook.
Для ручной проверки:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://jan-delivery-backend.onrender.com/webhook"
```

## Шаг 7: Тестирование

### 7.1 Проверьте backend API
```bash
# Проверка здоровья
curl https://jan-delivery-backend.onrender.com/health

# Проверка меню
curl https://jan-delivery-backend.onrender.com/api/menu
```

### 7.2 Проверьте Telegram Bot
1. Найдите вашего бота в Telegram
2. Отправьте `/start`
3. Нажмите кнопку "🍽️ Открыть меню"
4. Проверьте работу Mini App

### 7.3 Протестируйте заказ
1. Добавьте товары в корзину
2. Оформите тестовый заказ
3. Проверьте, что заказ появился в Google Sheets
4. Проверьте получение уведомления в Telegram

## Шаг 8: Мониторинг и логи

### 8.1 Просмотр логов в Render
1. Перейдите в Dashboard
2. Выберите сервис
3. Перейдите на вкладку "Logs"

### 8.2 Мониторинг работы
- Следите за статусом сервисов в Dashboard
- Проверяйте логи на наличие ошибок
- Мониторьте использование ресурсов

## Шаг 9: Настройка домена (опционально)

### 9.1 Для backend
1. В настройках сервиса нажмите "Settings"
2. Добавьте Custom Domain
3. Настройте DNS записи у регистратора

### 9.2 Для frontend
1. Аналогично настройте домен для frontend
2. Обновите URL в конфигурации и BotFather

## Troubleshooting

### Backend не запускается
- Проверьте переменные окружения
- Убедитесь в правильности Google credentials
- Проверьте синтаксис в .env файлах

### Telegram Bot не отвечает
- Проверьте правильность TELEGRAM_BOT_TOKEN
- Убедитесь, что webhook установлен
- Проверьте логи на наличие ошибок

### Google Sheets не работает
- Запустите тест: `node scripts/test-sheets.js`
- Проверьте права доступа Service Account
- Убедитесь в правильности GOOGLE_SHEETS_ID

### Frontend не загружается в Telegram
- Проверьте URL в BotFather
- Убедитесь, что frontend доступен по HTTPS
- Проверьте CORS настройки в backend

## Обновление приложения

### Обновление кода
1. Внесите изменения в код
2. Закоммитьте в GitHub
3. Render автоматически перезапустит сервисы

### Обновление зависимостей
```bash
cd backend
npm update
git add package*.json
git commit -m "Update dependencies"
git push
```

## Безопасность

### Рекомендации
- Регулярно обновляйте зависимости
- Используйте сильные токены и ключи
- Мониторьте необычную активность
- Настройте rate limiting для API

### Резервное копирование
- Экспортируйте Google Sheets регулярно
- Сохраняйте конфигурацию в безопасном месте
- Документируйте все изменения

## Масштабирование

При росте нагрузки рассмотрите:
- Переход на базу данных PostgreSQL
- Использование Redis для кэширования
- Настройку CDN для статических файлов
- Горизонтальное масштабирование backend

## Поддержка

Если возникли проблемы:
1. Проверьте документацию API
2. Изучите логи в Render Dashboard
3. Протестируйте компоненты отдельно
4. Обратитесь к сообществу разработчиков