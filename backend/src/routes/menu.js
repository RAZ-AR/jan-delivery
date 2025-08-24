const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET /api/menu - получить все блюда
router.get('/', menuController.getMenu);

// GET /api/menu/category/:category - получить блюда по категории
router.get('/category/:category', menuController.getMenuByCategory);

// GET /api/menu/:id - получить блюдо по ID
router.get('/:id', menuController.getMenuItem);

module.exports = router;
