// Тест системы зон доставки
const { checkDeliveryZone, getDeliveryZoneInfo } = require('./backend/src/utils/deliveryZone');

console.log('🧪 Тестирование зон доставки JAN Delivery\n');

// Информация о зоне
console.log('📍 Информация о зоне доставки:');
console.log(JSON.stringify(getDeliveryZoneInfo(), null, 2));
console.log('\n');

// Тестовые адреса в Нови Сад
const testAddresses = [
  // Внутри зоны доставки (примерные координаты)
  { name: 'Центр Нови Сада', lon: 20.46, lat: 44.81 },
  { name: 'Университет Нови Сад', lon: 20.45, lat: 44.82 },
  { name: 'Парк Дунавски', lon: 20.47, lat: 44.83 },
  
  // Граница зоны
  { name: 'Граница зоны 1', lon: 20.4502, lat: 44.8147 },
  { name: 'Граница зоны 2', lon: 20.4748, lat: 44.8120 },
  
  // Вне зоны доставки
  { name: 'Белград (далеко)', lon: 20.44, lat: 44.78 },
  { name: 'Суботица (далеко)', lon: 19.66, lat: 46.10 },
  { name: 'Неверные координаты', lon: null, lat: null }
];

console.log('🎯 Результаты тестирования:');
testAddresses.forEach(address => {
  const result = checkDeliveryZone(address.lon, address.lat);
  const status = result.inZone ? '✅ В зоне' : '❌ Вне зоны';
  
  console.log(`${status} | ${address.name}`);
  console.log(`   Координаты: ${address.lon}, ${address.lat}`);
  
  if (result.reason) {
    console.log(`   Причина: ${result.reason}`);
  }
  if (result.zone) {
    console.log(`   Зона: ${result.zone}`);
  }
  if (result.error) {
    console.log(`   Ошибка: ${result.error}`);
  }
  console.log('');
});

console.log('✨ Тест завершен!');