const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');

// Middleware bảo vệ các route cần xác thực
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Kiểm tra token trong header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Nếu không có token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không có token xác thực, vui lòng đăng nhập'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, config.jwtSecret);

            // Tìm user từ id trong token
            const user = await User.findByPk(decoded.user.id, {
                attributes: { exclude: ['password'] }
            });

            // Kiểm tra nếu không tìm thấy user
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Người dùng không tồn tại'
                });
            }

            // Kiểm tra nếu tài khoản bị vô hiệu hóa
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Tài khoản đã bị vô hiệu hóa'
                });
            }

            // Lưu thông tin user vào req
            req.user = user;
            next();
        } catch (error) {
            console.error('Token verification error:', error);

            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token không hợp lệ'
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token đã hết hạn, vui lòng đăng nhập lại'
                });
            }

            throw error;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xác thực',
            error: error.message
        });
    }
};

// Middleware kiểm tra quyền
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thực hiện hành động này'
            });
        }
        next();
    };
};
