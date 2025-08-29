const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET /api/menu - получить все блюда
router.get('/', menuController.getMenu);

// GET /api/menu/categories - получить структуру категорий с подкатегориями
router.get('/categories', menuController.getCategoriesStructure);

// GET /api/menu/category/:category - получить блюда по категории
router.get('/category/:category', menuController.getMenuByCategory);

// GET /api/menu/category/:category/subcategories - получить подкатегории категории
router.get('/category/:category/subcategories', menuController.getSubCategories);

// GET /api/menu/subcategory/:subCategory - получить блюда по подкатегории
router.get('/subcategory/:subCategory', menuController.getMenuBySubCategory);

// GET /api/menu/debug - debug информация о таблице
router.get('/debug', menuController.getDebugInfo);

// GET /api/menu/bot-debug - debug информации о боте
router.get('/bot-debug', menuController.getBotDebugInfo);

// GET /api/menu/:id - получить блюдо по ID (должно быть последним)
router.get('/:id', menuController.getMenuItem);

module.exports = router;
