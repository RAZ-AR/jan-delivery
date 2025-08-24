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
    let inZone = false;

    if (address) {
      inZone = await geocodingService.isDeliveryAvailable(address);
    } else if (typeof latitude === 'number' && typeof longitude === 'number') {
      inZone = await geocodingService.isDeliveryAvailableByCoords(latitude, longitude);
    } else {
      return res.status(400).json({ success: false, error: 'address or coordinates required' });
    }

    res.json({ success: true, data: { inZone } });
  } catch (error) {
    console.error('Ошибка проверки зоны доставки:', error);
    res.status(500).json({ success: false, error: 'Check delivery zone failed' });
  }
});

module.exports = router;

