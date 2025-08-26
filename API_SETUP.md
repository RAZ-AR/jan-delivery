# 🔑 API Keys Setup

## OpenRouteService API Key

Для работы автокомплита адресов нужен ключ OpenRouteService.

### Текущий ключ:
```
OPENROUTE_API_KEY=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjM2MGYxZjNhODhjNjRlNDI5MzkxY2VhNjBiMjcxNTE0IiwiaCI6Im11cm11cjY0In0=
```

### Добавить в Render.com:

#### Production:
1. Открыть https://dashboard.render.com
2. Выбрать сервис `jan-delivery`
3. Environment → Add Environment Variable
4. Name: `OPENROUTE_API_KEY`
5. Value: `eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjM2MGYxZjNhODhjNjRlNDI5MzkxY2VhNjBiMjcxNTE0IiwiaCI6Im11cm11cjY0In0=`

#### Staging: 
1. Открыть https://dashboard.render.com
2. Выбрать сервис `jan-delivery-dev`
3. Environment → Add Environment Variable  
4. Name: `OPENROUTE_API_KEY`
5. Value: `eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjM2MGYxZjNhODhjNjRlNDI5MzkxY2VhNjBiMjcxNTE0IiwiaCI6Im11cm11cjY0In0=`

### Проверить работу:

```bash
# После добавления ключа - проверить endpoints:
curl "https://jan-delivery.onrender.com/api/geocode/search?q=Belgrade"
curl -X POST "https://jan-delivery.onrender.com/api/geocode/reverse" -H "Content-Type: application/json" -d '{"latitude": 44.7866, "longitude": 20.4489}'
```

### Лимиты API:
- Бесплатный план: 2000 запросов/день
- Для production может понадобиться платный план

### Получить новый ключ:
1. Зайти на https://openrouteservice.org/dev/#/signup
2. Зарегистрироваться
3. Создать новый API Token
4. Заменить ключ в переменных окружения