const express = require('express');
const newsController = require('../controllers/news.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Public routes (no authentication required)
router.get('/public', newsController.getPublicNews);
router.get('/public/:id', newsController.getPublicNewsById);

// Lấy tất cả tin tức
router.get('/', protect, newsController.getAllNews);

// Lấy chi tiết tin tức
router.get('/:id', protect, newsController.getNewsById);

// Thêm tin tức mới (admin và manager)
router.post(
    '/',
    protect,
    authorize('admin', 'manager'),
    upload.single('thumbnail'),
    newsController.createNews
);

// Cập nhật tin tức (admin và manager)
router.put(
    '/:id',
    protect,
    authorize('admin', 'manager'),
    upload.single('thumbnail'),
    newsController.updateNews
);

// Xóa tin tức (admin và manager)
router.delete(
    '/:id',
    protect,
    authorize('admin', 'manager'),
    newsController.deleteNews
);

// Thay đổi trạng thái xuất bản
router.put(
    '/:id/toggle-publish',
    protect,
    authorize('admin', 'manager'),
    newsController.togglePublishStatus
);

module.exports = router;
