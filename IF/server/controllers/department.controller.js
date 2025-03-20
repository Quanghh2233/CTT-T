const { Department, User } = require('../models');

// Lấy tất cả phòng ban
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll({
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        console.error('Get all departments error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách phòng ban',
            error: error.message
        });
    }
};

// Lấy phòng ban theo ID
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng ban'
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error('Get department by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin phòng ban',
            error: error.message
        });
    }
};

// Tạo phòng ban mới
exports.createDepartment = async (req, res) => {
    try {
        const { name, code, description, headOfDepartment, phoneNumber, email } = req.body;

        // Kiểm tra mã phòng ban đã tồn tại
        const existingDepartment = await Department.findOne({ where: { code } });
        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: 'Mã phòng ban đã tồn tại'
            });
        }

        const department = await Department.create({
            name,
            code,
            description,
            headOfDepartment,
            phoneNumber,
            email
        });

        res.status(201).json({
            success: true,
            message: 'Tạo phòng ban thành công',
            data: department
        });
    } catch (error) {
        console.error('Create department error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tạo phòng ban mới',
            error: error.message
        });
    }
};

// Cập nhật phòng ban
exports.updateDepartment = async (req, res) => {
    try {
        const { name, description, headOfDepartment, phoneNumber, email } = req.body;
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng ban'
            });
        }

        const updatedDepartment = await department.update({
            name,
            description,
            headOfDepartment,
            phoneNumber,
            email
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật phòng ban thành công',
            data: updatedDepartment
        });
    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật phòng ban',
            error: error.message
        });
    }
};

// Xóa phòng ban
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng ban'
            });
        }

        // Kiểm tra xem có người dùng nào trong phòng ban
        const userCount = await User.count({ where: { DepartmentId: department.id } });

        if (userCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa phòng ban vì có ${userCount} người dùng đang thuộc phòng ban này`
            });
        }

        await department.destroy();

        res.status(200).json({
            success: true,
            message: 'Xóa phòng ban thành công'
        });
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa phòng ban',
            error: error.message
        });
    }
};

// Lấy danh sách người dùng trong phòng ban
exports.getDepartmentUsers = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng ban'
            });
        }

        const users = await User.findAll({
            where: { DepartmentId: department.id },
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get department users error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách người dùng trong phòng ban',
            error: error.message
        });
    }
};
