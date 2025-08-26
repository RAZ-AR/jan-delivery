const axios = require('axios');
const { checkDeliveryZone } = require('../utils/deliveryZone');

class GeocodingService {
  constructor() {
    this.apiKey = process.env.OPENROUTE_API_KEY;
    this.baseUrl = 'https://api.openrouteservice.org/geocode';
    // Центр доставки в Нови Сад (из KML зоны)
    this.deliveryCenter = { lat: 44.81, lon: 20.46 };
    this.deliveryRadiusMeters = 15000; // 15 км (для fallback)
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

  // Проверка, доставляем ли мы по адресу (используем полигон зоны доставки)
  async isDeliveryAvailable(address) {
    const coordinates = await this.geocodeAddress(address);
    if (!coordinates) return false;

    // Используем точную проверку по полигону
    const zoneCheck = checkDeliveryZone(coordinates.longitude, coordinates.latitude);
    return zoneCheck.inZone;
  }

  // Быстрая проверка по координатам (используем полигон зоны доставки)
  async isDeliveryAvailableByCoords(latitude, longitude) {
    const zoneCheck = checkDeliveryZone(longitude, latitude);
    return zoneCheck.inZone;
  }

  // Подробная проверка зоны доставки с дополнительной информацией
  async checkDeliveryZoneDetails(latitude, longitude) {
    return checkDeliveryZone(longitude, latitude);
  }

  // Автокомплит адресов для поиска
  async searchAddresses(query, limit = 5) {
    if (!this.apiKey) {
      console.warn('⚠️ OPENROUTE_API_KEY не установлен');
      return [];
    }

    if (!query || query.length < 2) {
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          api_key: this.apiKey,
          text: query,
          'boundary.country': 'RS', // Сербия для Белграда
          'focus.point.lat': this.deliveryCenter.lat,
          'focus.point.lon': this.deliveryCenter.lon,
          size: limit,
          layers: 'address,street,venue'
        },
        timeout: 10000
      });

      const features = response.data.features || [];
      
      return features.map(feature => {
        const props = feature.properties;
        return {
          id: props.id || props.gid,
          text: props.label,
          address: props.name,
          street: props.street,
          locality: props.locality || props.localadmin,
          region: props.region,
          coordinates: {
            longitude: feature.geometry.coordinates[0],
            latitude: feature.geometry.coordinates[1]
          },
          confidence: props.confidence || 0
        };
      }).sort((a, b) => b.confidence - a.confidence);

    } catch (error) {
      console.error('Ошибка поиска адресов:', error.response?.data || error.message);
      return [];
    }
  }

  // Получить подробную информацию об адресе по координатам
  async getAddressDetails(latitude, longitude) {
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
          size: 1,
          layers: 'address,street,venue'
        },
        timeout: 10000
      });

      const features = response.data.features;
      
      if (features && features.length > 0) {
        const feature = features[0];
        const props = feature.properties;
        
        return {
          formatted_address: props.label,
          street: props.street,
          house_number: props.housenumber,
          locality: props.locality || props.localadmin,
          region: props.region,
          postal_code: props.postalcode,
          country: props.country,
          coordinates: {
            latitude: latitude,
            longitude: longitude
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Ошибка получения деталей адреса:', error.response?.data || error.message);
      return null;
    }
  }
}

module.exports = new GeocodingService();
