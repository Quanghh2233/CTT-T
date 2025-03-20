import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Typography, Layout } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import { login } from '../../redux/actions/authActions';

const { Title } = Typography;
const { Content } = Layout;

const Login = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { isAuthenticated, error: authError } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/portal'); // Changed from '/' to '/portal'
        }

        if (authError) {
            setError(authError);
            setLoading(false);
        }
    }, [isAuthenticated, authError, navigate]);

    const onFinish = (values) => {
        setLoading(true);
        setError(null);
        dispatch(login(values.username, values.password));
    };

    return (
        <Layout style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0f2f5, #d7dde4)',
            backgroundImage: 'url("/login-bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Card style={{
                    width: 420,
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <Title level={2} style={{
                            marginBottom: 5,
                            background: 'linear-gradient(45deg, #0056b3, #1890ff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>BỘ TÀI CHÍNH</Title>
                        <Title level={4} style={{
                            marginTop: 0,
                            fontWeight: 'normal',
                            color: '#666'
                        }}>
                            Đăng nhập cổng thông tin nội bộ
                        </Title>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <Button type="link" icon={<HomeOutlined />} href="/">
                            Về trang chủ công khai
                        </Button>
                    </div>

                    {error && (
                        <Alert
                            message="Lỗi đăng nhập"
                            description={error}
                            type="error"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                    )}

                    <Form
                        form={form}
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Tên đăng nhập"
                                size="large"
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Mật khẩu"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={loading}
                                style={{
                                    height: '45px',
                                    fontSize: '16px',
                                    background: 'linear-gradient(45deg, #1890ff, #0056b3)',
                                    borderRadius: '6px'
                                }}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
};

export default Login;
