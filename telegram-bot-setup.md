# 🤖 Настройка Telegram Bot для JAN Delivery

## Текущие данные бота:
- **Token**: `7744854206:AAHI8khkC3IvQhI_fQJBZaFMteBI6WlK9cA`
- **Username**: `@Jan_delivery_bot`
- **Backend URL**: `https://jan-delivery-backend.onrender.com`

## 🚀 Пошаговая настройка Mini App:

### 1. Найти BotFather
Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)

### 2. Настроить Menu Button
```
/mybots
Выберите: Jan_delivery_bot
Bot Settings → Menu Button → Configure Menu Button
```

**Или используйте команду:**
```
/setmenubutton
@Jan_delivery_bot
```

**Введите:**
- **Button text**: `🍽️ Открыть меню`
- **Web App URL**: `https://YOUR_USERNAME.github.io/jan-delivery/`

### 3. Настроить описание бота
```
/setdescription
@Jan_delivery_bot
🍕 JAN Delivery - заказ вкусной еды с доставкой прямо в Telegram! 

🔥 Свежий шашлык, люля-кебаб и многое другое
📱 Удобное оформление заказов
🚚 Быстрая доставка
💳 Оплата наличными или картой

Нажмите Menu для заказа!
```

### 4. Добавить команды
```
/setcommands
@Jan_delivery_bot
```

**Команды:**
```
start - Запуск бота и открытие меню
menu - Открыть меню для заказа
orders - Мои заказы
help - Помощь и контакты
```

### 5. Настроить изображение бота (опционально)
```
/setuserpic
@Jan_delivery_bot
```
Загрузите изображение 512x512 пикселей с логотипом или фото еды.

## 📱 Тестирование Mini App:

### Проверьте работу:
1. Найдите `@Jan_delivery_bot` в Telegram
2. Нажмите `/start`
3. Нажмите кнопку `🍽️ Открыть меню`
4. Должно открыться ваше приложение с меню

### Если Mini App не открывается:
1. Проверьте, что GitHub Pages работает
2. Убедитесь, что URL правильный
3. Попробуйте обновить Menu Button в BotFather

## 🔧 Дополнительные настройки:

### Inline Mode (опционально):
```
/setinline
@Jan_delivery_bot
Поиск блюд в меню...
```

### Группы и каналы:
```
/setjoingroups
@Jan_delivery_bot
Disable
```

### Privacy Mode:
```
/setprivacy
@Jan_delivery_bot
Disable
```

## 📞 Команды для пользователей:

Пользователи смогут использовать:
- `/start` - начать работу с ботом
- `/menu` - открыть меню
- `/orders` - посмотреть заказы
- `/help` - получить помощь

## ✅ Финальная проверка:

1. Bot работает: ✅
2. Menu Button настроен: ⏳
3. Mini App открывается: ⏳
4. API работает: ✅
5. Google Sheets подключены: ✅

**После настройки Menu Button ваш бот будет полностью готов к использованию!** 🎉