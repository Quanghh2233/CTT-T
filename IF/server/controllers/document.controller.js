const { Document, User, Department } = require('../models');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// Lấy danh sách tài liệu
exports.getAllDocuments = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, departmentId } = req.query;

        const where = {};

        // Lọc theo danh mục
        if (category) {
            where.category = category;
        }

        // Lọc theo phòng ban
        if (departmentId) {
            where.DepartmentId = departmentId;
        }

        // Tìm kiếm theo tiêu đề hoặc mô tả
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        // Người dùng thông thường chỉ có thể xem tài liệu công khai hoặc thuộc phòng ban của mình
        if (req.user.role !== 'admin') {
            where[Op.or] = [
                { isPublic: true },
                { DepartmentId: req.user.DepartmentId }
            ];
        }

        const offset = (page - 1) * limit;
        const { count, rows: documents } = await Document.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'fullName', 'avatar'] },
                { model: Department }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: documents
        });
    } catch (error) {
        console.error('Get all documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách tài liệu',
            error: error.message
        });
    }
};

// Lấy chi tiết tài liệu theo ID
exports.getDocumentById = async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id, {
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'fullName', 'avatar'] },
                { model: Department }
            ]
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài liệu'
            });
        }

        // Kiểm tra quyền truy cập tài liệu
        if (!document.isPublic && document.DepartmentId !== req.user.DepartmentId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem tài liệu này'
            });
        }

        res.status(200).json({
            success: true,
            data: document
        });
    } catch (error) {
        console.error('Get document by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy chi tiết tài liệu',
            error: error.message
        });
    }
};

// Thêm tài liệu mới
exports.createDocument = async (req, res) => {
    try {
        const { title, description, category, isPublic, departmentId } = req.body;

        // Kiểm tra file tải lên
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng tải lên một tài liệu'
            });
        }

        // Tạo bản ghi tài liệu mới
        const document = await Document.create({
            title,
            description,
            fileName: req.file.originalname,
            filePath: req.file.filename,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            category,
            isPublic: isPublic === 'true',
            DepartmentId: departmentId || req.user.DepartmentId,
            UserId: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Tải lên tài liệu thành công',
            data: document
        });
    } catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải lên tài liệu',
            error: error.message
        });
    }
};

// Cập nhật thông tin tài liệu
exports.updateDocument = async (req, res) => {
    try {
        const { title, description, category, isPublic, departmentId } = req.body;

        const document = await Document.findByPk(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài liệu'
            });
        }

        // Kiểm tra quyền cập nhật (admin hoặc người tải lên)
        if (document.UserId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền cập nhật tài liệu này'
            });
        }

        const updatedDocument = await document.update({
            title,
            description,
            category,
            isPublic: isPublic === 'true',
            DepartmentId: departmentId || document.DepartmentId
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật tài liệu thành công',
            data: updatedDocument
        });
    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật tài liệu',
            error: error.message
        });
    }
};

// Xóa tài liệu
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài liệu'
            });
        }

        // Kiểm tra quyền xóa (admin hoặc người tải lên)
        if (document.UserId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa tài liệu này'
            });
        }

        // Xóa file tài liệu
        const filePath = path.join(__dirname, '../../../uploads/documents', document.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await document.destroy();

        res.status(200).json({
            success: true,
            message: 'Xóa tài liệu thành công'
        });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa tài liệu',
            error: error.message
        });
    }
};

// Tải tài liệu
exports.downloadDocument = async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài liệu'
            });
        }

        // Kiểm tra quyền truy cập tài liệu
        if (!document.isPublic && document.DepartmentId !== req.user.DepartmentId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền tải tài liệu này'
            });
        }

        const filePath = path.join(__dirname, '../../../uploads/documents', document.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File không tồn tại'
            });
        }

        // Tăng số lượt tải
        await document.update({ downloadCount: document.downloadCount + 1 });

        // Thiết lập header Content-Disposition để trình duyệt xử lý đúng tên file và định dạng
        res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
        res.setHeader('Content-Type', document.fileType);

        // Gửi file cho client
        res.download(filePath, document.fileName);
    } catch (error) {
        console.error('Download document error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tải tài liệu',
            error: error.message
        });
    }
};

// Xem trước tài liệu
exports.previewDocument = async (req, res) => {
    try {
        const document = await Document.findByPk(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tài liệu'
            });
        }

        // Kiểm tra quyền truy cập tài liệu
        if (!document.isPublic && document.DepartmentId !== req.user.DepartmentId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem tài liệu này'
            });
        }

        const filePath = path.join(__dirname, '../../../uploads/documents', document.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File không tồn tại'
            });
        }

        // Set appropriate headers
        res.setHeader('Content-Type', document.fileType);
        res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);

        // Send file for preview (inline)
        res.sendFile(filePath);
    } catch (error) {
        console.error('Preview document error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xem trước tài liệu',
            error: error.message
        });
    }
};
