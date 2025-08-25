# Как исправить ошибку 502 Backend на Render.com

## Проблема
Backend на `https://jan-delivery.onrender.com` возвращает ошибку 502, что означает, что сервис не развернут или работает неправильно.

## Решение: Пошаговое развертывание

### Шаг 1: Создайте новый Web Service на Render.com

1. Зайдите на [render.com](https://render.com)
2. Войдите в аккаунт или зарегистрируйтесь
3. Нажмите **"New +"** → **"Web Service"**

### Шаг 2: Подключите GitHub репозиторий

1. Выберите **"Build and deploy from a Git repository"**
2. Подключите GitHub аккаунт (если не подключен)
3. Найдите и выберите репозиторий: **`RAZ-AR/jan-delivery`**
4. Нажмите **"Connect"**

### Шаг 3: Настройте конфигурацию сервиса

**Основные настройки:**
- **Name:** `jan-delivery` (или любое другое имя)
- **Region:** выберите ближайший (Europe, Frankfurt рекомендуется)
- **Branch:** `main`
- **Root Directory:** оставьте пустым
- **Environment:** выберите **Docker**
- **Dockerfile Path:** `./Dockerfile`
- **Docker Build Context Directory:** оставьте пустым

### Шаг 4: Настройте переменные окружения

В разделе **"Environment Variables"** добавьте следующие переменные:

#### Обязательные переменные:
```
NODE_ENV=production
PORT=10000
```

#### Telegram Bot (получите у @BotFather):
```
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_WEBHOOK_URL=https://ваш-сервис.onrender.com/webhook
TELEGRAM_BOT_USERNAME=ваш_бот_username
```

#### Google Sheets (из Google Cloud Console):
```
GOOGLE_SHEETS_ID=id_вашей_таблицы
GOOGLE_SERVICE_ACCOUNT_EMAIL=email@проект.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

#### Frontend URL:
```
WEB_APP_URL=https://raz-ar.github.io/jan-delivery/
```

#### Опционально (для геокодирования):
```
OPENROUTE_API_KEY=ваш_ключ_openroute
```

### Шаг 5: Настройте план и запустите

1. **Plan:** выберите **Free** (0$/месяц)
2. Нажмите **"Create Web Service"**
3. Дождитесь завершения сборки (5-10 минут)

### Шаг 6: Проверьте развертывание

1. После успешной сборки откройте URL вашего сервиса
2. Перейдите на `https://ваш-сервис.onrender.com/health`
3. Должен вернуть: `{"status":"OK","uptime":...}`

### Шаг 7: Обновите URL в коде (если нужно)

Если ваш Render сервис получил другой URL (не jan-delivery.onrender.com), обновите его:

1. В файле `frontend/index.html` строка 9:
```html
<meta name="jan-api-base" content="https://ВАШ-НОВЫЙ-URL.onrender.com">
```

2. В файле `frontend/index.prod.html` строка 9:
```html
<meta name="jan-api-base" content="https://ВАШ-НОВЫЙ-URL.onrender.com">
```

3. Скопируйте изменения и загрузите на GitHub:
```bash
cp frontend/index.prod.html frontend/index.html
git add .
git commit -m "Update backend URL"
git push
```

## Как получить необходимые данные

### TELEGRAM_BOT_TOKEN:
1. Напишите @BotFather в Telegram
2. Отправьте `/newbot` или `/token`
3. Следуйте инструкциям

### GOOGLE_SHEETS_ID:
1. Откройте вашу Google Таблицу
2. URL выглядит как: `https://docs.google.com/spreadsheets/d/ВАШИ_ID_ЗДЕСЬ/edit`
3. Скопируйте ID из URL

### Google Service Account:
1. Зайдите в [Google Cloud Console](https://console.cloud.google.com)
2. Создайте проект или выберите существующий
3. Включите Google Sheets API
4. Создайте Service Account
5. Скачайте JSON файл с ключами
6. Из JSON файла возьмите `client_email` и `private_key`

## Проверка работоспособности

После развертывания проверьте:

1. **Health check:** `https://ваш-сервис.onrender.com/health`
2. **Menu API:** `https://ваш-сервис.onrender.com/api/menu`
3. **Telegram Webhook:** должен установиться автоматически при запуске

## Возможные проблемы и решения

### "Build failed" или ошибки Docker:
- Проверьте, что Dockerfile находится в корне репозитория
- Убедитесь, что выбран правильный Docker environment

### "Service keeps crashing":
- Проверьте логи в Render Dashboard
- Убедитесь, что все переменные окружения заданы правильно
- Проверьте формат GOOGLE_PRIVATE_KEY (должен содержать `\n`)

### "Menu API returns empty array":
- Проверьте GOOGLE_SHEETS_ID
- Убедитесь, что Service Account имеет доступ к таблице
- Проверьте структуру таблицы (должна соответствовать ожидаемой)

### Telegram bot не отвечает:
- Проверьте TELEGRAM_BOT_TOKEN
- Убедитесь, что TELEGRAM_WEBHOOK_URL правильный
- Проверьте логи - webhook должен установиться при запуске

## Финальная проверка

После успешного развертывания:

1. ✅ `https://ваш-сервис.onrender.com/health` возвращает OK
2. ✅ `https://ваш-сервис.onrender.com/api/menu` возвращает данные
3. ✅ Telegram bot отвечает на команды
4. ✅ GitHub Pages по адресу https://raz-ar.github.io/jan-delivery/ показывает меню

Если все пункты выполнены - развертывание успешно!