// JAN Delivery - Delivery Zone Checker
// Проверка попадания адреса в зону доставки на основе KML полигона

// Координаты зоны доставки "30 min" из KML файла
const DELIVERY_ZONE_POLYGON = [
  [20.4502733, 44.8147469],
  [20.4504879, 44.8123114],
  [20.4474838, 44.8067702],
  [20.4431493, 44.8019287],
  [20.4547365, 44.7965387],
  [20.4583843, 44.7998885],
  [20.4653366, 44.8061307],
  [20.4748638, 44.812007],
  [20.4725463, 44.816878],
  [20.4645212, 44.8242142],
  [20.4541357, 44.8177912],
  [20.4502733, 44.8147469] // Замыкающая точка
];

/**
 * Проверка, находится ли точка внутри полигона (Ray Casting Algorithm)
 * @param {number} longitude - Долгота точки
 * @param {number} latitude - Широта точки
 * @param {Array} polygon - Массив координат полигона [[lon, lat], ...]
 * @returns {boolean} - true, если точка внутри полигона
 */
function pointInPolygon(longitude, latitude, polygon) {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    if (((yi > latitude) !== (yj > latitude)) &&
        (longitude < (xj - xi) * (latitude - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

/**
 * Проверка, находится ли адрес в зоне доставки
 * @param {number} longitude - Долгота адреса
 * @param {number} latitude - Широта адреса
 * @returns {Object} - Результат проверки
 */
function checkDeliveryZone(longitude, latitude) {
  try {
    // Валидация координат
    if (!longitude || !latitude || 
        typeof longitude !== 'number' || typeof latitude !== 'number' ||
        isNaN(longitude) || isNaN(latitude)) {
      return {
        inZone: false,
        error: 'Неверные координаты'
      };
    }
    
    // Проверка базовых границ для Нови Сада
    if (longitude < 20.3 || longitude > 20.6 || 
        latitude < 44.7 || latitude > 44.9) {
      return {
        inZone: false,
        reason: 'Адрес слишком далеко от зоны доставки'
      };
    }
    
    // Проверка попадания в полигон
    const inZone = pointInPolygon(longitude, latitude, DELIVERY_ZONE_POLYGON);
    
    return {
      inZone,
      zone: inZone ? '30 min delivery zone' : null,
      coordinates: { longitude, latitude },
      reason: inZone ? null : 'Адрес вне зоны доставки'
    };
    
  } catch (error) {
    console.error('Ошибка проверки зоны доставки:', error);
    return {
      inZone: false,
      error: 'Ошибка проверки зоны доставки'
    };
  }
}

/**
 * Получить информацию о зоне доставки
 * @returns {Object} - Информация о зоне
 */
function getDeliveryZoneInfo() {
  return {
    name: '30 min delivery zone',
    description: 'Зона доставки в пределах 30 минут от ресторана',
    polygon: DELIVERY_ZONE_POLYGON,
    center: {
      longitude: 20.46, // Приблизительный центр полигона
      latitude: 44.81
    },
    city: 'Novi Sad, Serbia'
  };
}

module.exports = {
  checkDeliveryZone,
  getDeliveryZoneInfo,
  pointInPolygon,
  DELIVERY_ZONE_POLYGON
};