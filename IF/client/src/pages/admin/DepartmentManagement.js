import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Typography,
    Popconfirm,
    message,
    Tag,
    Tooltip
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    TeamOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import { getDepartments, addDepartment, updateDepartment, deleteDepartment, getDepartmentUsers } from '../../redux/actions/departmentActions';

const { Title } = Typography;
const { TextArea } = Input;

const DepartmentManagement = () => {
    const dispatch = useDispatch();
    const { departments, loading } = useSelector(state => state.department);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDepartment, setCurrentDepartment] = useState(null);
    const [modalTitle, setModalTitle] = useState('Thêm phòng ban mới');
    const [modalLoading, setModalLoading] = useState(false);
    const [departmentUsers, setDepartmentUsers] = useState([]);
    const [usersModalVisible, setUsersModalVisible] = useState(false);
    const [selectedDeptName, setSelectedDeptName] = useState('');

    useEffect(() => {
        dispatch(getDepartments());
    }, [dispatch]);

    const showAddModal = () => {
        form.resetFields();
        setIsEditing(false);
        setCurrentDepartment(null);
        setModalTitle('Thêm phòng ban mới');
        setIsModalVisible(true);
    };

    const showEditModal = (department) => {
        form.setFieldsValue({
            name: department.name,
            code: department.code,
            description: department.description,
            headOfDepartment: department.headOfDepartment,
            phoneNumber: department.phoneNumber,
            email: department.email
        });
        setIsEditing(true);
        setCurrentDepartment(department);
        setModalTitle('Cập nhật thông tin phòng ban');
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSubmit = async (values) => {
        setModalLoading(true);
        let success;

        if (isEditing) {
            success = await dispatch(updateDepartment(currentDepartment.id, values));
        } else {
            success = await dispatch(addDepartment(values));
        }

        setModalLoading(false);

        if (success) {
            setIsModalVisible(false);
        }
    };

    const handleDelete = async (department) => {
        try {
            const success = await dispatch(deleteDepartment(department.id));

            if (!success) {
                message.error('Không thể xóa phòng ban có người dùng');
            }
        } catch (error) {
            message.error('Không thể xóa phòng ban');
        }
    };

    const showUsers = async (department) => {
        try {
            const users = await dispatch(getDepartmentUsers(department.id));
            setDepartmentUsers(users);
            setSelectedDeptName(department.name);
            setUsersModalVisible(true);
        } catch (error) {
            message.error('Không thể lấy danh sách người dùng');
        }
    };

    const columns = [
        {
            title: 'Tên phòng ban',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mã phòng ban',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Trưởng phòng',
            dataIndex: 'headOfDepartment',
            key: 'headOfDepartment',
            render: (text) => text || 'Chưa phân công',
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            render: (_, record) => (
                <Space>
                    {record.phoneNumber && (
                        <Tooltip title={record.phoneNumber}>
                            <PhoneOutlined />
                        </Tooltip>
                    )}
                    {record.email && (
                        <Tooltip title={record.email}>
                            <MailOutlined />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<TeamOutlined />}
                        onClick={() => showUsers(record)}
                    >
                        Người dùng
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa phòng ban này?"
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

    const userColumns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Chức vụ',
            dataIndex: 'position',
            key: 'position',
            render: (text) => text || 'Chưa cập nhật',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
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
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={2}>Quản lý phòng ban</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showAddModal}
                >
                    Thêm phòng ban
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={departments}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                expandable={{
                    expandedRowRender: record => <p style={{ margin: 0 }}>{record.description || 'Không có mô tả'}</p>,
                }}
            />

            <Modal
                title={modalTitle}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Tên phòng ban"
                        rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Mã phòng ban"
                        rules={[{ required: true, message: 'Vui lòng nhập mã phòng ban' }]}
                    >
                        <Input disabled={isEditing} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="headOfDepartment"
                        label="Trưởng phòng"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
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

            <Modal
                title={`Danh sách người dùng - ${selectedDeptName}`}
                visible={usersModalVisible}
                onCancel={() => setUsersModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setUsersModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                <Table
                    columns={userColumns}
                    dataSource={departmentUsers}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            </Modal>
        </div>
    );
};

export default DepartmentManagement;
