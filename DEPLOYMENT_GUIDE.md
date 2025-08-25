# 🚀 JAN Delivery - Деплой на бесплатном хостинге

## 1. 📤 Push код в GitHub

```bash
# Если еще нет репозитория на GitHub:
# 1. Создайте новый репозиторий на github.com
# 2. Скопируйте URL репозитория
# 3. Выполните команды:

git remote add origin https://github.com/RAZ-AR/jan-delivery.git
git push -u origin main
```

## 2. 🖥️ Backend на Render.com

### Создание Web Service:
1. Зайти на [render.com](https://render.com) и войти через GitHub
2. "New" → "Web Service"
3. Подключить репозиторий `jan-delivery`
4. Настройки:
   - **Name**: `jan-delivery-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: оставить пустым

### Переменные окружения (Environment Variables):
```
NODE_ENV=production
PORT=3000
TELEGRAM_BOT_TOKEN=7744854206:AAHI8khkC3IvQhI_fQJBZaFMteBI6WlK9cA
TELEGRAM_WEBHOOK_URL=https://jan-delivery-backend.onrender.com
TELEGRAM_BOT_USERNAME=Jan_delivery_bot
WEB_APP_URL=https://raz-ar.github.io/jan-delivery
GOOGLE_SHEETS_ID=1TOHGRsYeoG0oo2ywJ2G9DJhb7mmcSxJvLBsiEiMIYIs
GOOGLE_SERVICE_ACCOUNT_EMAIL=jan-delivery-bot@jan-deliver.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCvCFedrv0E+0xt
Wwkv3nhwmRg9TnXGOyO93+fjHwDuYmgU1G68H/0Cwy55Xcnb95/YSpYS8abKTDQ5
/ngsfGNwNKH8PZVrZLINHC980qxcBQwoDgyE/MgKLiNgz7wRBOhOCJ6muVQZxk55
nTaFFEnKmYzSstNNzCQ5/tAzzImklhnMw5bPdyBzh0Tra4PzL868Q9dsPJ9hkwv5
6GHWwrB/L8gPPVaHgccDA9Oic0HhMBW6dwOojpA/g62KhE5RUd0NbpcTPKSM79hY
YTQ0X9jIOnAc6AMsOmo2bsjvTG24RUhjCajyDxoXwY1fwjqJIYgeVduYSvx8fQ5W
t5icNIQFAgMBAAECggEAB5tSX3Z1kDaxpXEBjwnZQcoi0mCWCrroPJNosFIDyC27
qJLA4JPNUEZA6fey/Z3J3cGuuv0Iish8CTyEvCjdvh3IymhiFYGR9rLlDMTacRdW
ZhPnjwyt+Y9JbKbVMrImvGQbLP4R6HAvWeavXLeQgL8NQ9zkr6qxtQQyHTDZly73
tzQbQDRUXILToLpm3oEm7Nq54g3Pveebnfd6uOPoDmvcuz9dblWHQHJmeWQTvHLq
13isPTTYxwu4p9zN43LxKCcze9ezFmZVwBxaHtMkxqpcUtIMBfH/mbbKTa4zORTQ
xO911s6R5nAYRxhU8pBVzKLZ1XLJwdGD/1PRAvpbMwKBgQDYMvFimxvae0h6TpC9
ZRT1GBgyzUivQcbebUVg7pYMiEfPvb6//ONYlMhhJ2C87KH57ppGktbrJFEJc3bS
q2y7tDTgiW6fAv6QS0Re2S8QWqhIwd6YNwGQKSxyoRc5iopXehy4BV5/8vHJ9tqv
yw3zS7ymhLcu4y4cWVQ2iMOQIwKBgQDPQU2Ofk66k5M5NUMx+RP3KsVOO9cPJOeH
uYJjo7PQO2dhKAFOUW1oZU4ihOjsH3miXDofWiPdYdxGnqx+CX/8892pQwGD+ryk
Ti2iuLgqq+/fQPAGbNauXWYrLfg+BoIS7DsGM+KHNTcu/zU5+kHeOqszlNy5ZU1I
td+hSB/JtwKBgQC2pxNYA0Mc6lrpOcb+u49hIeIPyW9G4YNqF1ct9WO/YsOItv2Y
pcZM6CYCLoqEEkcmKHceeKAqOJxeJ7aTdVB/pFen+3QB0z3OGkjA+SvR3UWfcmrk
nlQrvx1WGtLMQkducDQjJCYaYt3ziyJmsl4u1iWjaSx56GTkfnOvPww5kQKBgQCE
dfo5niR3PqaTo6UEpWrLR/y+maRDu5R2vGvHfvMHnU/fWpArHAPO+yBLE6NCdoNo
74T+UMAnV8pPIE6iZzPz2XDMI1Uuouw6HvUv0Ntz+lve1kQR9zHmUy9fXYwRKFut
+Glo93RKcgqI8Pd1zKqYe+q7luLTYxlX5VW+YLhgVQKBgGL1egSdZGNotjL09Ckd
ebZ7R8zmUYZthZKJQZPn0ZpZVbq7HXvQpGDukeXugUEiWi7XlRDfsc7PHtdSEEMM
4WJV/zT5n40b4cEgnRtzii7wkY9aLQgSVnUGdSldFJZAIc/50hEpXoM88z+gV9nO
EW+rXrL/+4Gm9nk/IOErqObr
-----END PRIVATE KEY-----
OPENROUTE_API_KEY=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjM2MGYxZjNhODhjNjRlNDI5MzkxY2VhNjBiMjcxNTE0IiwiaCI6Im11cm11cjY0In0=
```

⚠️ **Важно**: GOOGLE_PRIVATE_KEY вводить в одну строку без переносов!

## 3. 🌐 Frontend на GitHub Pages

### Настройка GitHub Pages:
1. В репозитории зайти в Settings → Pages
2. Source: "GitHub Actions"
3. Workflow уже настроен в `.github/workflows/deploy-frontend.yml`
4. После push на main ветку автоматически запустится деплой

### URL будет: `https://raz-ar.github.io/jan-delivery/`

## 4. 🤖 Настройка Telegram Bot

### В BotFather (@BotFather):
```
/mybots
Выбрать: Jan_delivery_bot
Bot Settings → Menu Button → Configure Menu Button
Web App URL: https://raz-ar.github.io/jan-delivery/
```

### Альтернативно через команды:
```
/setmenubutton
@Jan_delivery_bot
🍽️ Открыть меню
https://raz-ar.github.io/jan-delivery/
```

## 5. 🔧 Обновление URL в коде

После деплоя обновите:

**В .env на Render.com:**
```
WEB_APP_URL=https://raz-ar.github.io/jan-delivery
TELEGRAM_WEBHOOK_URL=https://jan-delivery-backend.onrender.com
```

**В frontend/index.html (уже обновлено):**
```html
<meta name="jan-api-base" content="https://jan-delivery-backend.onrender.com">
```

## 6. ✅ Проверка работы

1. **Backend**: https://jan-delivery-backend.onrender.com/health
2. **Menu API**: https://jan-delivery-backend.onrender.com/api/menu  
3. **Frontend**: https://raz-ar.github.io/jan-delivery/
4. **Telegram Bot**: найти @Jan_delivery_bot и нажать Menu Button

## 7. 🚀 Финальные шаги

```bash
# 1. Push код в GitHub
git push origin main

# 2. Дождаться деплоя GitHub Pages (2-5 минут)
# 3. Создать Web Service на Render.com
# 4. Настроить Menu Button в BotFather
# 5. Протестировать в Telegram!
```

**🎉 Готово! Ваше приложение будет работать полностью бесплатно!**

---
**Лимиты бесплатных планов:**
- Render.com: 750 часов в месяц (засыпает через 15 мин без активности)
- GitHub Pages: безлимитно для публичных репозиториев
- Google Sheets API: 100 запросов/100 секунд на пользователя