const { User, Department, News, Document } = require('../models');
const { Sequelize } = require('sequelize');

// Lấy thống kê tổng quan
exports.getOverviewStats = async (req, res) => {
    try {
        // Thực hiện các truy vấn thống kê song song
        const [
            usersCount,
            departmentsCount,
            newsCount,
            documentsCount,
            totalViews,
            totalDownloads,
            recentNews,
            recentDocuments
        ] = await Promise.all([
            User.count(),
            Department.count(),
            News.count(),
            Document.count(),
            News.sum('views'),
            Document.sum('downloadCount'),
            News.findAll({
                order: [['createdAt', 'DESC']],
                limit: 5
            }),
            Document.findAll({
                order: [['createdAt', 'DESC']],
                limit: 5
            })
        ]);

        // Thống kê tài liệu theo danh mục
        const documentsByCategory = await Document.findAll({
            attributes: [
                'category',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['category']
        });

        // Thống kê tin tức theo danh mục
        const newsByCategory = await News.findAll({
            attributes: [
                'category',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['category']
        });

        res.status(200).json({
            success: true,
            data: {
                usersCount,
                departmentsCount,
                newsCount,
                documentsCount,
                totalViews: totalViews || 0,
                totalDownloads: totalDownloads || 0,
                documentsByCategory,
                newsByCategory,
                recentNews,
                recentDocuments
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thống kê',
            error: error.message
        });
    }
};
