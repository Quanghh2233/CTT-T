const { User, Department } = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Lấy tất cả người dùng
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{ model: Department }],
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách người dùng',
            error: error.message
        });
    }
};

// Lấy thông tin một người dùng
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: Department }],
            attributes: { exclude: ['password'] }
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
        console.error('Get user by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin người dùng',
            error: error.message
        });
    }
};

// Cập nhật người dùng (admin)
exports.updateUser = async (req, res) => {
    try {
        const { fullName, email, role, DepartmentId, position, phoneNumber, isActive } = req.body;

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Cập nhật thông tin người dùng
        const updatedUser = await user.update({
            fullName,
            email,
            role,
            DepartmentId,
            position,
            phoneNumber,
            isActive: isActive !== undefined ? isActive : user.isActive
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin người dùng thành công',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật thông tin người dùng',
            error: error.message
        });
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Xóa avatar nếu không phải ảnh mặc định
        if (user.avatar && user.avatar !== 'default-avatar.png') {
            const avatarPath = path.join(__dirname, '../../../uploads/avatars', user.avatar);
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }
        }

        await user.destroy();

        res.status(200).json({
            success: true,
            message: 'Xóa người dùng thành công'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa người dùng',
            error: error.message
        });
    }
};

// Khóa/mở khóa người dùng
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Đảm bảo không thể vô hiệu hóa tài khoản admin cuối cùng
        if (user.role === 'admin' && user.isActive) {
            const adminCount = await User.count({ where: { role: 'admin', isActive: true } });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể vô hiệu hóa tài khoản admin cuối cùng'
                });
            }
        }

        await user.update({ isActive: !user.isActive });

        res.status(200).json({
            success: true,
            message: user.isActive ? 'Kích hoạt tài khoản thành công' : 'Vô hiệu hóa tài khoản thành công',
            data: user
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể thay đổi trạng thái người dùng',
            error: error.message
        });
    }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, position } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Xử lý avatar mới nếu có
        let avatar = user.avatar;
        if (req.file) {
            // Xóa avatar cũ nếu không phải mặc định
            if (user.avatar && user.avatar !== 'default-avatar.png') {
                const oldAvatarPath = path.join(__dirname, '../../../uploads/avatars', user.avatar);
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
            }
            avatar = req.file.filename;
        }

        // Cập nhật thông tin
        const updatedUser = await user.update({
            fullName,
            email,
            phoneNumber,
            position,
            avatar
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin cá nhân thành công',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật thông tin cá nhân',
            error: error.message
        });
    }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới'
            });
        }

        const user = await User.findByPk(req.user.id);

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không chính xác'
            });
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu
        await user.update({ password: hashedPassword });

        res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể đổi mật khẩu',
            error: error.message
        });
    }
};
