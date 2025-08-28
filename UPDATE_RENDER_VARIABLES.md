# Обновление переменных окружения на Render

## Новый ID Google Sheets
```
GOOGLE_SHEETS_ID=1TOHGRsYeoG0oo2ywJ2G9DJhb7mmcSxJvLBsiEiMIYIs
```

## Инструкция обновления

1. Перейти в Render Dashboard: https://render.com/
2. Найти сервис "jan-delivery-backend"
3. Перейти в Environment
4. Обновить переменную `GOOGLE_SHEETS_ID` на новое значение: `1TOHGRsYeoG0oo2ywJ2G9DJhb7mmcSxJvLBsiEiMIYIs`
5. Нажать "Save Changes"
6. Дождаться автоматического redeploy

## Проверка
После обновления проверить endpoints:
- https://jan-delivery.onrender.com/health
- https://jan-delivery.onrender.com/api/menu?lang=ru
- https://jan-delivery.onrender.com/api/menu/categories?lang=ru

Должно загружаться 69 блюд вместо предыдущих 50.

## Структура новой таблицы
Колонки в таблице:
- id, category, sub_category, sub_category_en, sub_category_sr 
- title, title_en, title_sr
- description, description_en, description_sr
- price, image, available, ingredients, weight, calories

## Категории в новой таблице
- Шашлык (подкатегории: свинина, курица, телятина, баранина, рыба, овощей)
- Люля-кебаб (подкатегории: Курица, Говядина, Баранина)
- Свинина
- Соусы (подкатегории: Красный острый, Белый чесночный, Наршараб, Сметана)
- Хачапури на углях
- Закуски
- Салаты
- Основные блюда
- Яичница
- Хинкали
- Супы