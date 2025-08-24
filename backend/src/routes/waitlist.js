const express = require('express');
const router = express.Router();
const googleSheetsService = require('../services/googleSheetsService');

// POST /api/waitlist { userId, phone, address, notes, coordinates? }
router.post('/', async (req, res) => {
  try {
    const sheetName = 'Waitlist';
    const {
      userId = '',
      phone = '',
      address = '',
      notes = '',
      coordinates = ''
    } = req.body || {};

    if (!address) {
      return res.status(400).json({ success: false, error: 'address is required' });
    }

    const createdAt = new Date().toISOString();
    const coordStr = coordinates ? JSON.stringify(coordinates) : '';
    const values = [createdAt, userId, phone, address, coordStr, notes];

    await googleSheetsService.appendToSheet(sheetName, values);

    res.json({ success: true, data: { createdAt } });
  } catch (error) {
    console.error('Ошибка добавления в Waitlist:', error);
    res.status(500).json({ success: false, error: 'Failed to add to waitlist' });
  }
});

module.exports = router;

