# 🚧 JAN Delivery - Development Workflow

## 🏗️ Структура веток

### Основные ветки:
- **`main`** - Production версия (стабильная)
  - Live: https://raz-ar.github.io/jan-delivery/
  - API: https://jan-delivery.onrender.com
  
- **`develop`** - Development версия (новые фичи)
  - Live: https://raz-ar.github.io/jan-delivery-dev/
  - API: https://jan-delivery-dev.onrender.com

### Рабочие ветки:
- **`feature/feature-name`** - Новые фичи
- **`hotfix/bug-name`** - Критические исправления
- **`release/v1.x.x`** - Подготовка релизов

## 🚀 Процесс разработки

### 1. Создание новой фичи:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/new-payment-method
# Разработка...
git push origin feature/new-payment-method
# Создание PR в develop
```

### 2. Тестирование на staging:
```bash
git checkout develop
git merge feature/new-payment-method
git push origin develop
# Автодеплой на staging окружение
```

### 3. Релиз в production:
```bash
git checkout main
git merge develop
git tag v1.1.0
git push origin main --tags
# Автодеплой в production
```

## 🌍 Окружения

### Production (Клиенты):
- **Frontend:** https://raz-ar.github.io/jan-delivery/
- **Backend:** https://jan-delivery.onrender.com
- **Branch:** `main`
- **Database:** Production Google Sheets
- **Bot:** Production Telegram Bot

### Staging/Development (Тестирование):
- **Frontend:** https://raz-ar.github.io/jan-delivery-dev/
- **Backend:** https://jan-delivery-dev.onrender.com  
- **Branch:** `develop`
- **Database:** Development Google Sheets (копия)
- **Bot:** Test Telegram Bot

### Local (Разработка):
- **Frontend:** `file://frontend/index.html`
- **Backend:** `http://localhost:3000`
- **Branch:** `feature/*`
- **Database:** Local test data
- **Bot:** Test Bot с ngrok

## 📋 Чеклист для новой фичи

### Планирование:
- [ ] Создать issue в GitHub
- [ ] Описать требования и mockups
- [ ] Оценить сложность

### Разработка:
- [ ] Создать feature ветку
- [ ] Написать код
- [ ] Добавить тесты
- [ ] Обновить документацию

### Тестирование:
- [ ] Локальное тестирование
- [ ] Merge в develop
- [ ] Тест на staging окружении
- [ ] QA тестирование

### Релиз:
- [ ] Code review
- [ ] Merge в main
- [ ] Создать tag версии
- [ ] Деплой в production
- [ ] Проверить production

## 🔧 Настройка окружений

### 📋 Checklist настройки staging:
1. ✅ Создана структура веток (main, develop)
2. ✅ Созданы workflow файлы для CI/CD
3. ✅ Подготовлен staging конфигурация (render-staging.yaml)
4. ✅ Создан staging HTML (index.dev.html)
5. ⏳ **НУЖНО ВЫПОЛНИТЬ ВРУЧНУЮ:** Следовать [STAGING_SETUP.md](STAGING_SETUP.md)

### Staging Backend (Render):
1. Создать новый Web Service: `jan-delivery-dev`
2. Подключить branch: `develop` 
3. Использовать Docker environment с ./Dockerfile
4. Environment variables:
```env
NODE_ENV=staging
TELEGRAM_BOT_TOKEN=<test_bot_token>
GOOGLE_SHEETS_ID=<dev_sheets_id>
TELEGRAM_WEBHOOK_URL=https://jan-delivery-dev.onrender.com/webhook
WEB_APP_URL=https://raz-ar.github.io/jan-delivery-dev/
```

### Staging Frontend (GitHub Pages):
**Автоматический деплой через GitHub Actions:**
- При push в `develop` ветку → автодеплой staging
- При push в `main` ветку → автодеплой production
- Используются разные HTML файлы для разных окружений

### Development Database:
1. Скопировать production Google Sheets
2. Переименовать в "JAN Delivery - DEV"
3. Дать доступ service account
4. Использовать DEV sheets ID в staging

> 📖 **Подробная инструкция:** [STAGING_SETUP.md](STAGING_SETUP.md)

## 🤖 CI/CD Pipeline

### GitHub Actions workflow:
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main, develop]

jobs:
  deploy-frontend:
    if: github.ref == 'refs/heads/main'
    # Deploy to production GitHub Pages
    
  deploy-frontend-staging:
    if: github.ref == 'refs/heads/develop'  
    # Deploy to staging GitHub Pages
```

## 📊 Мониторинг

### Production:
- Status: https://jan-delivery.onrender.com/health
- Logs: Render Dashboard
- Metrics: Built-in monitoring

### Staging:
- Status: https://jan-delivery-dev.onrender.com/health
- Testing: Automated tests on PR
- QA: Manual testing environment

## 🚨 Hotfix процесс

Для критических багов:
```bash
git checkout main
git checkout -b hotfix/critical-bug-fix
# Исправить баг
git checkout main
git merge hotfix/critical-bug-fix
git checkout develop  
git merge hotfix/critical-bug-fix
git push origin main develop
```

## 👥 Team Workflow

### Роли:
- **Developer** - создает feature ветки, делает PR
- **Reviewer** - проверяет код, approve PR
- **QA** - тестирует на staging
- **DevOps** - управляет окружениями

### Code Review:
- Минимум 1 approval для merge
- Автоматические проверки (linting, tests)
- Manual QA на staging перед production

## 📝 Changelog

Ведем файл `CHANGELOG.md`:
```markdown
## [1.1.0] - 2024-01-15
### Added
- New payment method integration
- Order tracking notifications

### Fixed  
- Cart calculation bug
- Mobile responsive issues
```