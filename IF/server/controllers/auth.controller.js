const { User, Department } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kiểm tra thông tin đăng nhập
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu!'
            });
        }

        // Tìm người dùng
        const user = await User.findOne({
            where: { username },
            include: [{ model: Department }]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không chính xác!'
            });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không chính xác!'
            });
        }

        // Kiểm tra trạng thái
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản đã bị vô hiệu hóa!'
            });
        }

        // Tạo token
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            config.jwtSecret,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) {
                    console.error('JWT sign error:', err);
                    throw err;
                }

                // Loại bỏ mật khẩu từ phản hồi
                const safeUser = {
                    id: user.id,
                    username: user.username,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    Department: user.Department
                };

                res.status(200).json({
                    success: true,
                    message: 'Đăng nhập thành công!',
                    token,
                    user: safeUser
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đăng nhập!',
            error: error.message
        });
    }
};

// Đăng ký người dùng mới (chỉ admin mới có quyền)
exports.register = async (req, res) => {
    try {
        const { username, password, fullName, email, role, departmentId, position, phoneNumber } = req.body;

        // Kiểm tra username đã tồn tại chưa
        let user = await User.findOne({ where: { username } });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập đã tồn tại'
            });
        }

        // Kiểm tra email đã tồn tại chưa
        user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'Email đã tồn tại'
            });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo người dùng mới
        user = await User.create({
            username,
            password: hashedPassword,
            fullName,
            email,
            role: role || 'staff',
            DepartmentId: departmentId,
            position,
            phoneNumber,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi đăng ký',
            error: error.message
        });
    }
};

// Lấy thông tin người dùng đang đăng nhập
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Department }]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin người dùng',
            error: error.message
        });
    }
};
