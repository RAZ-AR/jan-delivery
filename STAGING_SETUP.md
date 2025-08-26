# 🚧 Настройка Staging Окружения

## 📋 Checklist для настройки

### 1. 🚀 Настройка Render.com Staging

1. **Создать новый Web Service:**
   - Зайти в [Render Dashboard](https://dashboard.render.com/)
   - Нажать "New" → "Web Service"
   - Подключить репозиторий: `https://github.com/RAZ-AR/jan-delivery.git`
   - Настроить:
     - **Name:** `jan-delivery-dev`
     - **Branch:** `develop`
     - **Environment:** `Docker`
     - **Dockerfile Path:** `./Dockerfile`

2. **Environment Variables для staging:**
   ```env
   NODE_ENV=staging
   PORT=3000
   TELEGRAM_BOT_TOKEN=<staging_bot_token>
   GOOGLE_SHEETS_ID=<dev_sheets_id>
   GOOGLE_SERVICE_ACCOUNT_EMAIL=<same_as_prod>
   GOOGLE_PRIVATE_KEY=<same_as_prod>
   TELEGRAM_WEBHOOK_URL=https://jan-delivery-dev.onrender.com/webhook
   WEB_APP_URL=https://raz-ar.github.io/jan-delivery-dev/
   ```

3. **Deploy staging backend:**
   - Service будет автоматически деплоиться при push в develop ветку
   - URL: `https://jan-delivery-dev.onrender.com`

### 2. 🤖 Создание Test Telegram Bot

1. **Создать нового бота через [@BotFather](https://t.me/BotFather):**
   ```
   /newbot
   JAN Delivery DEV
   jan_delivery_dev_bot
   ```

2. **Настроить Mini App для тестового бота:**
   ```
   /setmenubutton
   @jan_delivery_dev_bot
   🍽️ Открыть меню [DEV]
   https://raz-ar.github.io/jan-delivery-dev/
   ```

3. **Настроить webhook:**
   ```
   /setwebhook
   https://jan-delivery-dev.onrender.com/webhook
   ```

### 3. 📊 Создание Development Google Sheets

1. **Скопировать production таблицу:**
   - Открыть оригинальную таблицу
   - File → Make a copy
   - Переименовать: "JAN Delivery - DEV"

2. **Дать доступ Service Account:**
   - Share → Add same service account email
   - Role: Editor

3. **Скопировать ID новой таблицы:**
   - Из URL: `https://docs.google.com/spreadsheets/d/[SHEETS_ID]/edit`
   - Добавить в переменные окружения Render

### 4. 🌐 Настройка GitHub Pages для Staging

**Вариант A: Создать отдельный репозиторий (Рекомендуется)**

1. Создать новый репозиторий: `jan-delivery-dev`
2. В GitHub Actions будет автопуш из develop ветки
3. Включить GitHub Pages для нового репо

**Вариант B: Использовать gh-pages ветку в том же репо**

1. Создать ветку `gh-pages-dev`
2. Настроить GitHub Pages для этой ветки
3. Изменить workflow для push в эту ветку

### 5. 🔄 Тестирование Staging

После настройки проверить:

1. **Backend API:**
   ```bash
   curl https://jan-delivery-dev.onrender.com/health
   curl https://jan-delivery-dev.onrender.com/api/menu
   ```

2. **Frontend:**
   - Открыть https://raz-ar.github.io/jan-delivery-dev/
   - Проверить загрузку меню
   - Убедиться что в заголовке показывается "[DEV]"

3. **Telegram Bot:**
   - Найти @jan_delivery_dev_bot
   - Отправить /start
   - Нажать "🍽️ Открыть меню [DEV]"
   - Сделать тестовый заказ

### 6. 🛠️ Development Workflow

После настройки staging можно использовать workflow:

```bash
# Создать новую фичу
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Разработка...
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Создать PR в develop
# После merge в develop - автодеплой на staging
# Тестировать на https://jan-delivery-dev.onrender.com

# После тестирования - merge develop в main
# Автодеплой в production
```

## 🔗 URLs после настройки

### Staging Environment:
- **Frontend:** https://raz-ar.github.io/jan-delivery-dev/
- **Backend:** https://jan-delivery-dev.onrender.com
- **Health:** https://jan-delivery-dev.onrender.com/health
- **Bot:** @jan_delivery_dev_bot

### Production Environment:
- **Frontend:** https://raz-ar.github.io/jan-delivery/
- **Backend:** https://jan-delivery.onrender.com
- **Health:** https://jan-delivery.onrender.com/health
- **Bot:** @jan_delivery_bot (основной)

## ⚠️ Важные заметки

1. **Данные:** DEV и PROD используют разные Google Sheets
2. **Боты:** Разные Telegram боты для разных окружений
3. **API Keys:** Можно использовать одни и те же Google API ключи
4. **Домены:** Разные поддомены для staging и production

## 🚨 Troubleshooting

### Проблема: Staging показывает production данные
**Решение:** Проверить GOOGLE_SHEETS_ID в переменных Render

### Проблема: GitHub Pages не обновляется
**Решение:** Проверить права GitHub Actions в настройках репо

### Проблема: Telegram webhook не работает
**Решение:** Проверить TELEGRAM_WEBHOOK_URL и перенастроить через BotFather