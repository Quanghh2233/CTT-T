const express = require('express');
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Lấy tất cả người dùng (chỉ admin)
router.get('/', protect, authorize('admin'), userController.getAllUsers);

// Lấy thông tin một người dùng (chỉ admin)
router.get('/:id', protect, authorize('admin'), userController.getUserById);

// Cập nhật người dùng (chỉ admin)
router.put('/:id', protect, authorize('admin'), userController.updateUser);

// Xóa người dùng (chỉ admin)
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

// Khóa/mở khóa người dùng (chỉ admin)
router.put('/:id/toggle-status', protect, authorize('admin'), userController.toggleUserStatus);

// Cập nhật thông tin cá nhân (tất cả người dùng)
router.put('/profile', protect, upload.single('avatar'), userController.updateProfile);

// Đổi mật khẩu (tất cả người dùng)
router.put('/change-password', protect, userController.changePassword);

module.exports = router;
