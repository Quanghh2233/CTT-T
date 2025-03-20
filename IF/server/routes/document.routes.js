const express = require('express');
const documentController = require('../controllers/document.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Lấy tất cả tài liệu
router.get('/', protect, documentController.getAllDocuments);

// Lấy chi tiết tài liệu
router.get('/:id', protect, documentController.getDocumentById);

// Thêm tài liệu mới
router.post(
    '/',
    protect,
    upload.single('document'),
    documentController.createDocument
);

// Cập nhật thông tin tài liệu
router.put(
    '/:id',
    protect,
    documentController.updateDocument
);

// Xóa tài liệu
router.delete(
    '/:id',
    protect,
    documentController.deleteDocument
);

// Tải tài liệu
router.get(
    '/:id/download',
    protect,
    documentController.downloadDocument
);

// Xem trước tài liệu
router.get(
    '/:id/preview',
    protect,
    documentController.previewDocument
);

module.exports = router;
