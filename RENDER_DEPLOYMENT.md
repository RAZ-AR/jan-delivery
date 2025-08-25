# JAN Delivery - Развертывание на Render.com

## Автоматический деплой через GitHub

1. Подключите GitHub репозиторий к Render.com
2. Создайте новый Web Service
3. Выберите ваш репозиторий `jan-delivery`
4. Настройки развертывания:
   - **Environment**: Docker
   - **Region**: любой ближайший
   - **Branch**: main
   - **Root Directory**: оставьте пустым
   - **Dockerfile Path**: `./Dockerfile`

## Переменные окружения

Настройте следующие переменные в Render Dashboard:

### Обязательные
```
NODE_ENV=production
PORT=3000
```

### Telegram Bot
```
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_WEBHOOK_URL=https://ваш-сервис.onrender.com/webhook
TELEGRAM_BOT_USERNAME=ваш_бот_username
```

### Google Sheets
```
GOOGLE_SHEETS_ID=id_вашей_таблицы
GOOGLE_SERVICE_ACCOUNT_EMAIL=email@проект.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

### Геокодирование (опционально)
```
OPENROUTE_API_KEY=ваш_ключ_openroute
```

### Frontend URL
```
WEB_APP_URL=https://raz-ar.github.io/jan-delivery/
```

## После деплоя

1. Проверьте что сервис запустился: `https://ваш-сервис.onrender.com/health`
2. Обновите webhook URL в настройках Telegram бота
3. Проверьте работу API: `https://ваш-сервис.onrender.com/api/menu`

## Проблемы и решения

### Сервис не запускается
- Проверьте логи в Render Dashboard
- Убедитесь что все переменные окружения заданы
- Проверьте что Google Sheets credentials правильные

### Нет данных в меню
- Проверьте GOOGLE_SHEETS_ID
- Убедитесь что сервисный аккаунт имеет доступ к таблице
- Проверьте формат GOOGLE_PRIVATE_KEY (должен содержать \n)

### Telegram бот не работает
- Проверьте TELEGRAM_BOT_TOKEN
- Убедитесь что TELEGRAM_WEBHOOK_URL правильный
- Проверьте что webhook установлен (логи при запуске)