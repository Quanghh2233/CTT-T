const { News, User } = require('../models');
const fs = require('fs');
const path = require('path');

// Lấy danh sách tin tức
exports.getAllNews = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;

        const where = {};

        // Lọc theo danh mục
        if (category) {
            where.category = category;
        }

        // Tìm kiếm theo tiêu đề hoặc nội dung
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ];
        }

        // Mặc định chỉ hiển thị tin đã xuất bản, admin và manager có thể xem tất cả
        if (req.user.role !== 'admin' && req.user.role !== 'manager') {
            where.isPublished = true;
        }

        const offset = (page - 1) * limit;
        const { count, rows: news } = await News.findAndCountAll({
            where,
            limit,
            offset,
            include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatar'] }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: news
        });
    } catch (error) {
        console.error('Get all news error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách tin tức',
            error: error.message
        });
    }
};

// Get public news (no authentication required)
exports.getPublicNews = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;

        const where = {
            isPublished: true // Only published news
        };

        // Filter by category
        if (category) {
            where.category = category;
        }

        // Search by title or content
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;
        const { count, rows: news } = await News.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatar'] }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            data: news
        });
    } catch (error) {
        console.error('Get public news error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách tin tức',
            error: error.message
        });
    }
};

// Lấy chi tiết tin tức theo ID
exports.getNewsById = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id, {
            include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatar'] }]
        });

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        // Kiểm tra quyền xem tin chưa xuất bản
        if (!news.isPublished && req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem tin tức này'
            });
        }

        // Tăng lượt xem
        await news.update({ views: news.views + 1 });

        res.status(200).json({
            success: true,
            data: news
        });
    } catch (error) {
        console.error('Get news by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy chi tiết tin tức',
            error: error.message
        });
    }
};

// Get public news detail
exports.getPublicNewsById = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id, {
            include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatar'] }]
        });

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        // Only allow access to published news
        if (!news.isPublished) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xem tin tức này'
            });
        }

        // Increase view count
        await news.update({ views: news.views + 1 });

        res.status(200).json({
            success: true,
            data: news
        });
    } catch (error) {
        console.error('Get public news by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy chi tiết tin tức',
            error: error.message
        });
    }
};

// Thêm tin tức mới
exports.createNews = async (req, res) => {
    try {
        const { title, content, summary, category, isPublished } = req.body;

        // Xử lý thumbnail nếu có
        const thumbnail = req.file ? req.file.filename : null;

        const news = await News.create({
            title,
            content,
            summary,
            category,
            thumbnail,
            isPublished: isPublished === 'true',
            UserId: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Tạo tin tức thành công',
            data: news
        });
    } catch (error) {
        console.error('Create news error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tạo tin tức mới',
            error: error.message
        });
    }
};

// Cập nhật tin tức
exports.updateNews = async (req, res) => {
    try {
        const { title, content, summary, category, isPublished } = req.body;

        const news = await News.findByPk(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        // Kiểm tra quyền cập nhật (chỉ cho phép tác giả, admin hoặc manager)
        if (news.UserId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền cập nhật tin tức này'
            });
        }

        // Xử lý thumbnail mới nếu có
        let thumbnail = news.thumbnail;
        if (req.file) {
            // Xóa thumbnail cũ nếu có
            if (news.thumbnail) {
                const oldThumbnailPath = path.join(__dirname, '../../../uploads/thumbnails', news.thumbnail);
                if (fs.existsSync(oldThumbnailPath)) {
                    fs.unlinkSync(oldThumbnailPath);
                }
            }
            thumbnail = req.file.filename;
        }

        const updatedNews = await news.update({
            title,
            content,
            summary,
            category,
            thumbnail,
            isPublished: isPublished === 'true'
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật tin tức thành công',
            data: updatedNews
        });
    } catch (error) {
        console.error('Update news error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật tin tức',
            error: error.message
        });
    }
};

// Xóa tin tức
exports.deleteNews = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        // Kiểm tra quyền xóa (chỉ cho phép tác giả, admin hoặc manager)
        if (news.UserId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa tin tức này'
            });
        }

        // Xóa thumbnail nếu có
        if (news.thumbnail) {
            const thumbnailPath = path.join(__dirname, '../../../uploads/thumbnails', news.thumbnail);
            if (fs.existsSync(thumbnailPath)) {
                fs.unlinkSync(thumbnailPath);
            }
        }

        await news.destroy();

        res.status(200).json({
            success: true,
            message: 'Xóa tin tức thành công'
        });
    } catch (error) {
        console.error('Delete news error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa tin tức',
            error: error.message
        });
    }
};

// Thay đổi trạng thái xuất bản tin tức
exports.togglePublishStatus = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy tin tức'
            });
        }

        // Kiểm tra quyền thay đổi (chỉ cho phép tác giả, admin hoặc manager)
        if (news.UserId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thay đổi trạng thái tin tức này'
            });
        }

        await news.update({ isPublished: !news.isPublished });

        res.status(200).json({
            success: true,
            message: news.isPublished ? 'Đã xuất bản tin tức' : 'Đã hủy xuất bản tin tức',
            data: news
        });
    } catch (error) {
        console.error('Toggle publish status error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể thay đổi trạng thái xuất bản tin tức',
            error: error.message
        });
    }
};
