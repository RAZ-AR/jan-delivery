# СРОЧНОЕ ИСПРАВЛЕНИЕ БОТА TELEGRAM

## Проблема
Бот Telegram не видит базу данных, потому что Render API всё ещё использует старую Google Sheets таблицу (50 блюд вместо 69).

## Решение
Нужно обновить переменную окружения на Render:

### В Render Dashboard:
1. Перейти на https://render.com/
2. Найти сервис "jan-delivery-backend"
3. Environment → Environment Variables
4. Найти `GOOGLE_SHEETS_ID`
5. Изменить значение с текущего на: **1TOHGRsYeoG0oo2ywJ2G9DJhb7mmcSxJvLBsiEiMIYIs**
6. Нажать "Save Changes"
7. Дождаться автоматического redeploy (2-3 минуты)

### Проверка после обновления:
```bash
# Должно показать 69 блюд вместо 50
curl https://jan-delivery.onrender.com/api/menu?lang=ru | grep -o '"id"' | wc -l

# Должно показать новые категории
curl https://jan-delivery.onrender.com/api/menu/categories?lang=ru
```

### Проверка бота:
1. Открыть бота в Telegram
2. Отправить /start
3. Нажать "🍽️ Open Menu" 
4. Должно загрузиться меню с 69 блюдами и новыми категориями

## Альтернативное решение (если нет доступа к Dashboard):
Попросить владельца аккаунта обновить переменную или дать доступ к Render Dashboard.

## Структура новой базы:
- **69 блюд** (было 50)
- **11 категорий** с подкатегориями
- **Поддержка 3 языков**: RU, EN, SR
- **Правильная структура**: category → subcategory навигация

## Ожидаемый результат:
После обновления бот будет показывать полное меню с правильной навигацией по категориям и подкатегориям.