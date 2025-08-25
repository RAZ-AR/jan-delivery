# 🚀 Активация GitHub Pages - ОБЯЗАТЕЛЬНО!

## ❌ Проблема: GitHub Pages не активированы
URL `https://raz-ar.github.io/jan-delivery/` возвращает 404 потому что GitHub Pages не включены.

## ✅ Решение: Активировать GitHub Pages

### 📋 Пошаговая инструкция:

#### 1. Зайдите в ваш репозиторий:
```
https://github.com/RAZ-AR/jan-delivery
```

#### 2. Перейдите в Settings:
- Нажмите на вкладку **"Settings"** (справа от "Code", "Issues", "Pull requests")

#### 3. Найдите раздел Pages:
- В левом меню прокрутите вниз до раздела **"Pages"**
- Нажмите **"Pages"**

#### 4. Настройте Source:
- **Source**: выберите **"GitHub Actions"** 
- (НЕ "Deploy from a branch")

#### 5. Сохраните настройки:
- Настройки сохранятся автоматически

#### 6. Дождитесь деплоя:
- Перейдите в раздел **"Actions"** (вкладка рядом с "Pull requests")
- Должен запуститься workflow **"Deploy Frontend to GitHub Pages"**
- Дождитесь зеленой галочки ✅ (2-5 минут)

---

## 🔧 Альтернативный способ (если Actions не работает):

#### 1. В Settings → Pages:
- **Source**: выберите **"Deploy from a branch"**
- **Branch**: выберите **"main"**  
- **Folder**: выберите **"/frontend"**

#### 2. Нажмите **"Save"**

---

## ✅ Проверка работы:

После активации:

### 1. Проверьте URL:
```bash
curl -I https://raz-ar.github.io/jan-delivery/
```
Должен вернуть **200 OK** вместо 404

### 2. Откройте в браузере:
```
https://raz-ar.github.io/jan-delivery/
```
Должен открыться ваш сайт с меню

### 3. Проверьте в Telegram:
- Найдите `@Jan_delivery_bot`
- Нажмите кнопку **"🍽️ Открыть меню"**
- Должно открыться Mini App

---

## 🚨 Важно:

### После активации Pages обновите Telegram Bot:
```
/mybots
Jan_delivery_bot
Bot Settings
Menu Button  
Configure Menu Button
```

**URL должен быть ТОЧНО:**
```
https://raz-ar.github.io/jan-delivery/
```

### Проверьте статус Pages:
В GitHub → Settings → Pages должно быть:
```
✅ Your site is live at https://raz-ar.github.io/jan-delivery/
```

---

## 🔄 Если не работает:

### 1. Проверьте публичность репозитория:
- Settings → General → Danger Zone
- Репозиторий должен быть **Public** (не Private)

### 2. Проверьте Actions:
- Actions → "I understand my workflows, go ahead and enable them"

### 3. Принудительный перезапуск:
- Actions → выберите последний workflow → "Re-run all jobs"

---

## 🎯 После активации Pages:

✅ GitHub Pages работает  
✅ Telegram Bot открывает Mini App  
✅ Пользователи могут заказывать еду  

**🚀 Активируйте Pages СЕЙЧАС - это займет 2 минуты!**