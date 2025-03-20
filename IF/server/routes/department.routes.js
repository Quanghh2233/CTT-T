const express = require('express');
const departmentController = require('../controllers/department.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Lấy tất cả phòng ban
router.get('/', protect, departmentController.getAllDepartments);

// Lấy thông tin phòng ban theo ID
router.get('/:id', protect, departmentController.getDepartmentById);

// Thêm phòng ban mới (chỉ admin)
router.post('/', protect, authorize('admin'), departmentController.createDepartment);

// Cập nhật phòng ban (chỉ admin)
router.put('/:id', protect, authorize('admin'), departmentController.updateDepartment);

// Xóa phòng ban (chỉ admin)
router.delete('/:id', protect, authorize('admin'), departmentController.deleteDepartment);

// Lấy danh sách người dùng thuộc phòng ban
router.get('/:id/users', protect, departmentController.getDepartmentUsers);

module.exports = router;
