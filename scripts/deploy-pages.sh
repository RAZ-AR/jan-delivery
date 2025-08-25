#!/bin/bash
set -e

echo "🚀 Разворачиваем JAN Delivery на GitHub Pages..."

# Используем production версию index.html для GitHub Pages
cp frontend/index.prod.html frontend/index.html

echo "✅ Production index.html готов"

# Добавляем все изменения
git add .

# Коммитим изменения
git commit -m "Deploy to GitHub Pages: $(date '+%Y-%m-%d %H:%M:%S')"

# Пушим на GitHub
git push origin main

echo "🎉 JAN Delivery успешно развернут на GitHub Pages!"
echo "📱 Доступен по адресу: https://raz-ar.github.io/jan-delivery/"