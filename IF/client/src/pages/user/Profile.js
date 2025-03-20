import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Form,
    Input,
    Button,
    Card,
    Avatar,
    Typography,
    Tabs,
    message,
    Upload,
    Row,
    Col,
    Divider
} from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons';
import { updateProfile, changePassword } from '../../redux/actions/authActions';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Cập nhật thông tin cá nhân
    const handleProfileUpdate = async (values) => {
        setLoading(true);

        // Tạo FormData để gửi cả thông tin và file
        const formData = new FormData();
        formData.append('fullName', values.fullName);
        formData.append('email', values.email);
        formData.append('phoneNumber', values.phoneNumber || '');
        formData.append('position', values.position || '');

        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        const result = await dispatch(updateProfile(formData));

        if (result.success) {
            message.success(result.message);
        } else {
            message.error(result.message);
        }

        setLoading(false);
    };

    // Đổi mật khẩu
    const handlePasswordChange = async (values) => {
        setLoading(true);

        const result = await dispatch(changePassword(values.currentPassword, values.newPassword));

        if (result.success) {
            message.success(result.message);
            passwordForm.resetFields();
        } else {
            message.error(result.message);
        }

        setLoading(false);
    };

    // Xử lý khi chọn file avatar
    const handleAvatarChange = ({ file }) => {
        if (file.status === 'done' || file.status === 'uploading') {
            return;
        }

        setAvatarFile(file);

        // Hiển thị preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Lấy source của avatar
    const getAvatarSrc = () => {
        if (avatarPreview) {
            return avatarPreview;
        }

        if (user && user.avatar) {
            return user.avatar.startsWith('http')
                ? user.avatar
                : `/uploads/avatars/${user.avatar}`;
        }

        return null;
    };

    if (!user) {
        return <div>Đang tải thông tin...</div>;
    }

    return (
        <div>
            <Title level={2}>Thông tin cá nhân</Title>
            <Divider />

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={8}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Avatar
                                size={120}
                                icon={<UserOutlined />}
                                src={getAvatarSrc()}
                            />
                            <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                                {user.fullName}
                            </Title>
                            <Text type="secondary">{user.position || 'Chưa cập nhật chức vụ'}</Text>

                            <Divider />

                            <div style={{ textAlign: 'left' }}>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Điện thoại:</strong> {user.phoneNumber || 'Chưa cập nhật'}</p>
                                <p><strong>Phòng ban:</strong> {user.Department?.name || 'Chưa cập nhật'}</p>
                                <p><strong>Vai trò:</strong> {
                                    user.role === 'admin' ? 'Quản trị viên' :
                                        user.role === 'manager' ? 'Quản lý' : 'Nhân viên'
                                }</p>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={16}>
                    <Card>
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="Cập nhật thông tin" key="1">
                                <Form
                                    form={profileForm}
                                    layout="vertical"
                                    onFinish={handleProfileUpdate}
                                    initialValues={{
                                        fullName: user.fullName,
                                        email: user.email,
                                        phoneNumber: user.phoneNumber || '',
                                        position: user.position || ''
                                    }}
                                >
                                    <Form.Item
                                        name="fullName"
                                        label="Họ và tên"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                                    >
                                        <Input prefix={<UserOutlined />} />
                                    </Form.Item>

                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email' },
                                            { type: 'email', message: 'Email không hợp lệ' }
                                        ]}
                                    >
                                        <Input prefix={<MailOutlined />} />
                                    </Form.Item>

                                    <Form.Item
                                        name="phoneNumber"
                                        label="Số điện thoại"
                                    >
                                        <Input prefix={<PhoneOutlined />} />
                                    </Form.Item>

                                    <Form.Item
                                        name="position"
                                        label="Chức vụ"
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        name="avatar"
                                        label="Ảnh đại diện"
                                    >
                                        <Upload
                                            beforeUpload={() => false}
                                            onChange={handleAvatarChange}
                                            showUploadList={false}
                                        >
                                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                                        </Upload>
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Cập nhật thông tin
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>

                            <TabPane tab="Đổi mật khẩu" key="2">
                                <Form
                                    form={passwordForm}
                                    layout="vertical"
                                    onFinish={handlePasswordChange}
                                >
                                    <Form.Item
                                        name="currentPassword"
                                        label="Mật khẩu hiện tại"
                                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>

                                    <Form.Item
                                        name="newPassword"
                                        label="Mật khẩu mới"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>

                                    <Form.Item
                                        name="confirmPassword"
                                        label="Xác nhận mật khẩu mới"
                                        dependencies={['newPassword']}
                                        rules={[
                                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('newPassword') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Đổi mật khẩu
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Profile;
