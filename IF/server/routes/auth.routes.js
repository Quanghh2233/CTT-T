const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Đăng nhập
router.post('/login', authController.login);

// Đăng ký (chỉ admin)
router.post('/register', protect, authorize('admin'), authController.register);

// Lấy thông tin người dùng hiện tại
router.get('/me', protect, authController.getMe);

module.exports = router;
