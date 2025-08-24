# Настройка Google Sheets API для JAN Delivery

## Обзор
JAN Delivery использует Google Sheets как базу данных для хранения меню, заказов и пользователей. Это руководство поможет настроить Google Sheets API.

## Шаг 1: Создание Google Cloud проекта

### 1.1 Перейдите в Google Cloud Console
- Откройте https://console.cloud.google.com/
- Войдите в аккаунт Google

### 1.2 Создайте новый проект
- Нажмите на селектор проекта вверху страницы
- Выберите "New Project"
- Название проекта: `jan-delivery`
- Нажмите "Create"

### 1.3 Включите Google Sheets API
- В поиске найдите "Google Sheets API"
- Нажмите на "Google Sheets API"
- Нажмите "Enable"

## Шаг 2: Создание Service Account

### 2.1 Создайте Service Account
- Перейдите в "IAM & Admin" → "Service Accounts"
- Нажмите "Create Service Account"
- Имя: `jan-delivery-bot`
- Описание: `Service account for JAN Delivery Telegram bot`
- Нажмите "Create and Continue"

### 2.2 Назначьте роли
- Выберите роль: "Editor" (или создайте кастомную с доступом к Sheets)
- Нажмите "Continue"
- Нажмите "Done"

### 2.3 Создайте ключ
- Найдите созданный Service Account в списке
- Нажмите на email Service Account
- Перейдите на вкладку "Keys"
- Нажмите "Add Key" → "Create new key"
- Выберите формат "JSON"
- Нажмите "Create"
- Файл автоматически скачается

## Шаг 3: Создание Google Sheets документа

### 3.1 Создайте новую таблицу
- Откройте https://sheets.google.com/
- Нажмите "+" чтобы создать новую таблицу
- Переименуйте в "JAN Delivery Database"

### 3.2 Скопируйте ID таблицы
- Из URL таблицы скопируйте ID
- Пример URL: `https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J/edit`
- ID: `1A2B3C4D5E6F7G8H9I0J`

### 3.3 Настройте доступ
- Нажмите кнопку "Share" 
- Добавьте email Service Account из шага 2.1
- Дайте права "Editor"
- Нажмите "Send"

## Шаг 4: Создание листов

### 4.1 Лист "Menu"
- Переименуйте первый лист в "Menu"
- В первую строку добавьте заголовки:
```
A1: id
B1: name  
C1: description
D1: price
E1: category
F1: image
G1: available
H1: ingredients
I1: weight
J1: calories
```

### 4.2 Лист "Orders"
- Создайте новый лист с названием "Orders"
- В первую строку добавьте заголовки:
```
A1: id
B1: userId
C1: userInfo
D1: items
E1: total
F1: address
G1: coordinates
H1: status
I1: createdAt
J1: estimatedDelivery
K1: phone
L1: notes
```

### 4.3 Лист "Users"
- Создайте новый лист с названием "Users"
- В первую строку добавьте заголовки:
```
A1: userId
B1: first_name
C1: last_name
D1: username
E1: language_code
F1: phone
G1: address
H1: createdAt
I1: updatedAt
```

## Шаг 5: Настройка переменных окружения

### 5.1 Извлеките данные из JSON ключа
Откройте скачанный JSON файл и найдите:
- `client_email` - это ваш Service Account Email
- `private_key` - это приватный ключ

### 5.2 Создайте .env файл
В корне проекта создайте файл `.env`:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_ID=1A2B3C4D5E6F7G8H9I0J
GOOGLE_SERVICE_ACCOUNT_EMAIL=jan-delivery-bot@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nВАШ_ПРИВАТНЫЙ_КЛЮЧ_ЗДЕСЬ\n-----END PRIVATE KEY-----\n"
```

⚠️ **Важно**: 
- Замените значения на ваши реальные данные
- Приватный ключ должен быть в кавычках
- Символы `\n` в ключе должны остаться как есть

## Шаг 6: Тестирование подключения

### 6.1 Установите зависимости
```bash
cd backend
npm install
```

### 6.2 Проверьте подключение
Создайте тестовый файл `test-sheets.js`:

```javascript
require('dotenv').config();
const { google } = require('googleapis');

async function testConnection() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Menu!A1:J1'
    });

    console.log('✅ Подключение успешно!');
    console.log('Заголовки Menu:', response.data.values[0]);
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
  }
}

testConnection();
```

Запустите тест:
```bash
node test-sheets.js
```

## Шаг 7: Заполнение тестовыми данными

### 7.1 Добавьте тестовое меню
В лист "Menu" добавьте несколько строк с тестовыми блюдами:

```
A2: pizza001    B2: Маргарита     C2: Классическая пицца с томатами    D2: 450    E2: пицца     F2:           G2: TRUE    H2: томаты,моцарелла,базилик    I2: 350г    J2: 280
A3: burger001   B3: Чизбургер     C3: Сочный бургер с сыром           D3: 320    E3: бургеры   F3:           G3: TRUE    H3: говядина,сыр,салат,лук      I3: 250г    J3: 420
A4: salad001    B4: Цезарь        C4: Салат с курицей и сухариками    D4: 280    E4: салаты    F4:           G4: TRUE    H4: курица,салат,сухарики       I4: 180г    J4: 180
A5: drink001    B5: Кока-Кола     C5: Газированный напиток            D5: 120    E5: напитки   F5:           G5: TRUE    H5:                             I5: 0.33л   J5: 139
```

### 7.2 Проверьте API
Запустите сервер и проверьте endpoints:

```bash
npm run dev
```

Откройте в браузере:
- http://localhost:3000/api/menu - должен вернуть меню
- http://localhost:3000/health - проверка работы API

## Возможные проблемы и решения

### Ошибка 403: Forbidden
- Проверьте, что Service Account имеет доступ к таблице
- Убедитесь, что Google Sheets API включен

### Ошибка парсинга приватного ключа
- Убедитесь, что ключ в .env файле в кавычках
- Проверьте, что символы `\n` не были изменены

### Ошибка "Spreadsheet not found"
- Проверьте правильность GOOGLE_SHEETS_ID
- Убедитесь, что таблица доступна Service Account

### Ошибка "Range not found"  
- Проверьте названия листов: "Menu", "Orders", "Users"
- Убедитесь, что заголовки в первой строке

## Безопасность

### Защита ключей
- Никогда не коммитьте .env файл в git
- Используйте переменные окружения в продакшене
- Регулярно ротируйте Service Account ключи

### Ограничения доступа
- Дайте Service Account минимальные необходимые права
- Используйте отдельную таблицу для продакшена
- Настройте мониторинг доступа к API

## Следующие шаги

После успешной настройки Google Sheets:
1. Настройте Telegram Bot
2. Получите OpenRouteService API ключ  
3. Настройте деплой на Render.com
4. Протестируйте полный workflow

## Полезные ссылки

- [Google Sheets API документация](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Service Account документация](https://cloud.google.com/iam/docs/service-accounts)