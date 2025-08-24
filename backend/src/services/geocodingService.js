const axios = require('axios');

class GeocodingService {
  constructor() {
    this.apiKey = process.env.OPENROUTE_API_KEY;
    this.baseUrl = 'https://api.openrouteservice.org/geocode';
    // Центр Белграда
    this.deliveryCenter = { lat: 44.7866, lon: 20.4489 };
    this.deliveryRadiusMeters = 15000; // 15 км
  }

  // Геокодирование адреса (получение координат)
  async geocodeAddress(address) {
    if (!this.apiKey) {
      console.warn('⚠️ OPENROUTE_API_KEY не установлен');
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          api_key: this.apiKey,
          text: address,
          boundary_country: 'RU',
          size: 1
        },
        timeout: 5000
      });

      const features = response.data.features;
      
      if (features && features.length > 0) {
        const coordinates = features[0].geometry.coordinates;
        return {
          longitude: coordinates[0],
          latitude: coordinates[1],
          formatted_address: features[0].properties.label
        };
      }

      return null;
    } catch (error) {
      console.error('Ошибка геокодирования:', error.message);
      return null;
    }
  }

  // Обратное геокодирование (получение адреса по координатам)
  async reverseGeocode(latitude, longitude) {
    if (!this.apiKey) {
      console.warn('⚠️ OPENROUTE_API_KEY не установлен');
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/reverse`, {
        params: {
          api_key: this.apiKey,
          'point.lat': latitude,
          'point.lon': longitude,
          size: 1
        },
        timeout: 5000
      });

      const features = response.data.features;
      
      if (features && features.length > 0) {
        return {
          address: features[0].properties.label,
          region: features[0].properties.region,
          locality: features[0].properties.locality
        };
      }

      return null;
    } catch (error) {
      console.error('Ошибка обратного геокодирования:', error.message);
      return null;
    }
  }

  // Расчет расстояния между точками
  async calculateDistance(fromLat, fromLon, toLat, toLon) {
    if (!this.apiKey) {
      console.warn('⚠️ OPENROUTE_API_KEY не установлен');
      return null;
    }

    try {
      const response = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car',
        {
          coordinates: [[fromLon, fromLat], [toLon, toLat]]
        },
        {
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      const route = response.data.routes[0];
      
      if (route) {
        return {
          distance: Math.round(route.summary.distance), // в метрах
          duration: Math.round(route.summary.duration / 60) // в минутах
        };
      }

      return null;
    } catch (error) {
      console.error('Ошибка расчета расстояния:', error.message);
      return null;
    }
  }

  // Проверка, доставляем ли мы по адресу (Белград, радиус 15км)
  async isDeliveryAvailable(address) {
    const coordinates = await this.geocodeAddress(address);
    if (!coordinates) return false;

    const route = await this.calculateDistance(
      this.deliveryCenter.lat,
      this.deliveryCenter.lon,
      coordinates.latitude,
      coordinates.longitude
    );
    if (!route) return false;
    return route.distance <= this.deliveryRadiusMeters;
  }

  // Быстрая проверка по координатам
  async isDeliveryAvailableByCoords(latitude, longitude) {
    const route = await this.calculateDistance(
      this.deliveryCenter.lat,
      this.deliveryCenter.lon,
      latitude,
      longitude
    );
    if (!route) return false;
    return route.distance <= this.deliveryRadiusMeters;
  }
}

module.exports = new GeocodingService();
