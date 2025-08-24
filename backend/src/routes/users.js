const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users - создать/обновить пользователя
router.post('/', userController.createOrUpdateUser);

// GET /api/users/:userId - получить пользователя по ID
router.get('/:userId', userController.getUser);

// PUT /api/users/:userId/address - обновить адрес пользователя
router.put('/:userId/address', userController.updateUserAddress);

module.exports = router;