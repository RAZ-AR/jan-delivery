const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegramService');

// Telegraf webhook callback
router.post('/', telegramService.webhookCallback());

module.exports = router;
