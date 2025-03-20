import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    Tag,
    Typography,
    Avatar,
    Switch,
    Popconfirm,
    message
} from 'antd';
import {
    UserOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    LockOutlined
} from '@ant-design/icons';
import { getUsers, addUser, updateUser, deleteUser, toggleUserStatus } from '../../redux/actions/userActions';
import { getDepartments } from '../../redux/actions/departmentActions';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
    const dispatch = useDispatch();
    const { users, loading } = useSelector(state => state.user);
    const { departments } = useSelector(state => state.department);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [modalTitle, setModalTitle] = useState('Thêm người dùng mới');
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        dispatch(getUsers());
        dispatch(getDepartments());
    }, [dispatch]);

    const showAddModal = () => {
        form.resetFields();
        setIsEditing(false);
        setCurrentUser(null);
        setModalTitle('Thêm người dùng mới');
        setIsModalVisible(true);
    };

    const showEditModal = (user) => {
        form.setFieldsValue({
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            departmentId: user.DepartmentId,
            position: user.position,
            phoneNumber: user.phoneNumber
        });
        setIsEditing(true);
        setCurrentUser(user);
        setModalTitle('Cập nhật thông tin người dùng');
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSubmit = async (values) => {
        setModalLoading(true);
        let success;

        if (isEditing) {
            success = await dispatch(updateUser(currentUser.id, values));
        } else {
            success = await dispatch(addUser(values));
        }

        setModalLoading(false);

        if (success) {
            setIsModalVisible(false);
            dispatch(getUsers()); // Refresh user list
        }
    };

    const handleToggleStatus = async (user) => {
        await dispatch(toggleUserStatus(user.id));
    };

    const handleDelete = async (user) => {
        try {
            await dispatch(deleteUser(user.id));
        } catch (error) {
            message.error('Không thể xóa người dùng');
        }
    };

    const columns = [
        {
            title: 'Người dùng',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (_, record) => (
                <Space>
                    <Avatar src={record.avatar ? `/uploads/avatars/${record.avatar}` : null} icon={<UserOutlined />} />
                    <div>
                        <div>{record.fullName}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>{record.username}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phòng ban',
            dataIndex: 'Department',
            key: 'department',
            render: (department) => department?.name || 'Chưa phân công',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                let color = 'blue';
                let text = 'Nhân viên';

                if (role === 'admin') {
                    color = 'red';
                    text = 'Quản trị viên';
                } else if (role === 'manager') {
                    color = 'green';
                    text = 'Quản lý';
                }

                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={() => handleToggleStatus(record)}
                    disabled={record.role === 'admin' && record.isActive} // Không thể vô hiệu hóa admin
                />
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa người dùng này?"
                        onConfirm={() => handleDelete(record)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Quản lý người dùng</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showAddModal}
                >
                    Thêm người dùng
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={modalTitle}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="username"
                        label="Tên đăng nhập"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                    >
                        <Input disabled={isEditing} />
                    </Form.Item>

                    {!isEditing && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                    >
                        <Select>
                            <Option value="staff">Nhân viên</Option>
                            <Option value="manager">Quản lý</Option>
                            <Option value="admin">Quản trị viên</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="departmentId"
                        label="Phòng ban"
                        rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
                    >
                        <Select>
                            {departments && departments.map(dept => (
                                <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="position"
                        label="Chức vụ"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={modalLoading}>
                            {isEditing ? 'Cập nhật' : 'Thêm'}
                        </Button>
                        <Button style={{ marginLeft: 8 }} onClick={handleCancel}>
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
