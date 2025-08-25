# 🍕 JAN Delivery - Инструкция по настройке

## Что уже сделано:

✅ **Проект настроен и запущен локально**
- Backend API запущен на порту 3000
- Frontend подключен к локальному API
- Все зависимости установлены
- Конфигурация проверена

## Текущий статус:

🖥️ **Backend**: http://localhost:3000
- ✅ Health check: `/health` работает
- ✅ Menu API: `/api/menu` работает (но пустой - нужна Google Sheets)
- ⚠️ Google Sheets: нужно создать таблицу с правильным ID

🌐 **Frontend**: файлы готовы к работе
- ✅ index.html настроен на локальный API
- ✅ Все JS модули подключены
- ✅ Telegram Web App интеграция готова

## Что нужно сделать дальше:

### 1. Создание Google Sheets

Текущий ID в .env файле (`1m6Y_tHGpO2wZjkXrVcQpEeU8bN3tWxA9FcKhEsPbMvE`) не существует.

**Варианты решения:**

#### Вариант A: Создать новую таблицу вручную
1. Зайти в [Google Sheets](https://sheets.google.com)
2. Создать новую таблицу "JAN Delivery Database"
3. Создать 3 листа: Menu, Orders, Users
4. Настроить заголовки согласно документации в `docs/google-sheets/`
5. Добавить service account `jan-delivery-bot@jan-deliver.iam.gserviceaccount.com` как редактор
6. Скопировать ID таблицы из URL в .env файл

#### Вариант B: Использовать готовую таблицу
Если у вас уже есть готовая таблица, просто обновите `GOOGLE_SHEETS_ID` в .env файле.

### 2. Заполнение тестовыми данными

После создания таблицы добавьте тестовые данные:

**Menu лист:**
```
id | name | description | price | category | image | available | ingredients | weight | calories
1 | Маргарита | Классическая пицца | 450 | Пицца | | TRUE | томаты, сыр | 350г | 280
2 | Пепперони | Острая пицца | 520 | Пицца | | TRUE | пепперони, сыр | 380г | 320
```

**Orders лист:** (можно оставить только заголовки)
```
id | userId | userInfo | items | total | address | coordinates | status | createdAt | estimatedDelivery | phone | notes
```

**Users лист:** (можно оставить только заголовки)
```
userId | first_name | last_name | username | language_code | phone | address | createdAt | updatedAt
```

### 3. Telegram Bot настройка

1. Создать бота через [@BotFather](https://t.me/BotFather)
2. Получить токен (уже есть в .env)
3. Настроить Mini App в BotFather:
   - `/newapp` - создать Mini App
   - Указать URL: https://your-frontend-url.com
   - Добавить описание и фото

### 4. Деплой (опционально)

Для деплоя на Render.com:
1. Backend: создать Web Service из папки `backend/`
2. Frontend: создать Static Site из папки `frontend/`
3. Обновить переменные окружения
4. Обновить API URL в frontend

## Файлы для тестирования:

- **test-frontend.html** - простая страница для тестирования API
- **create-sheets.js** - скрипт для создания Google Sheets (требует права доступа)
- **scripts/test-sheets.js** - тестирование подключения к Google Sheets

## Команды для разработки:

```bash
# Запуск backend
cd backend && npm start

# Или в dev режиме
cd backend && npm run dev

# Тест API
curl http://localhost:3000/health
curl http://localhost:3000/api/menu

# Открыть frontend
open frontend/index.html
```

## Текущая конфигурация:

**API Base URL**: `http://localhost:3000` (для разработки)
**Google Sheets ID**: `1m6Y_tHGpO2wZjkXrVcQpEeU8bN3tWxA9FcKhEsPbMvE` (нужно заменить)
**Service Account**: `jan-delivery-bot@jan-deliver.iam.gserviceaccount.com`

---

✨ **Приложение готово к работе! Осталось только настроить Google Sheets.**