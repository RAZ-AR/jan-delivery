const express = require('express');
const router = express.Router();
const geocodingService = require('../services/geocodingService');

// POST /api/geocode { address }
router.post('/', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, error: 'address is required' });
    }

    const data = await geocodingService.geocodeAddress(address);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Ошибка геокодирования:', error);
    res.status(500).json({ success: false, error: 'Geocoding failed' });
  }
});

// POST /api/check-delivery-zone { address | latitude, longitude }
router.post('/check-delivery-zone', async (req, res) => {
  try {
    const { address, latitude, longitude } = req.body;
    let zoneData = null;

    if (address) {
      // Сначала геокодируем адрес
      const coordinates = await geocodingService.geocodeAddress(address);
      if (!coordinates) {
        return res.status(400).json({ success: false, error: 'Address not found' });
      }
      
      // Проверяем зону доставки
      zoneData = await geocodingService.checkDeliveryZoneDetails(coordinates.latitude, coordinates.longitude);
      zoneData.address = coordinates.formatted_address;
      
    } else if (typeof latitude === 'number' && typeof longitude === 'number') {
      zoneData = await geocodingService.checkDeliveryZoneDetails(latitude, longitude);
    } else {
      return res.status(400).json({ success: false, error: 'address or coordinates required' });
    }

    res.json({ success: true, data: zoneData });
  } catch (error) {
    console.error('Ошибка проверки зоны доставки:', error);
    res.status(500).json({ success: false, error: 'Check delivery zone failed' });
  }
});

// GET /api/geocode/search?q=query - автокомплит адресов
router.get('/search', async (req, res) => {
  try {
    const { q, limit } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const suggestions = await geocodingService.searchAddresses(q, parseInt(limit) || 5);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Ошибка поиска адресов:', error);
    res.status(500).json({ success: false, error: 'Address search failed' });
  }
});

// POST /api/geocode/reverse { latitude, longitude } - получить адрес по координатам
router.post('/reverse', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ success: false, error: 'Valid latitude and longitude required' });
    }

    const addressDetails = await geocodingService.getAddressDetails(latitude, longitude);
    
    if (!addressDetails) {
      return res.status(404).json({ success: false, error: 'Address not found for coordinates' });
    }

    res.json({ success: true, data: addressDetails });
  } catch (error) {
    console.error('Ошибка обратного геокодирования:', error);
    res.status(500).json({ success: false, error: 'Reverse geocoding failed' });
  }
});

module.exports = router;

