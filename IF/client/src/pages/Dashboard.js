import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, List, Typography, Spin, Space } from 'antd';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
    FileOutlined,
    TeamOutlined,
    NotificationOutlined,
    EyeOutlined
} from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/vi';

const { Title, Text } = Typography;

moment.locale('vi');

const Dashboard = () => {
    const { user } = useSelector(state => state.auth);
    const [stats, setStats] = useState(null);
    const [latestNews, setLatestNews] = useState([]);
    const [latestDocuments, setLatestDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, newsRes, docsRes] = await Promise.all([
                    axios.get('/api/stats'),
                    axios.get('/api/news?limit=5'),
                    axios.get('/api/documents?limit=5')
                ]);

                setStats(statsRes.data.data);
                setLatestNews(newsRes.data.data);
                setLatestDocuments(docsRes.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    return (
        <div>
            <Title level={2}>Xin chào, {user.fullName}!</Title>
            <Text type="secondary">Chào mừng bạn đến với Cổng thông tin điện tử nội bộ Bộ Tài Chính</Text>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{
                        background: 'linear-gradient(120deg, #e6f7ff, #bae7ff)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                    }}>
                        <Statistic
                            title={<span style={{ color: '#0056b3', fontWeight: 'bold' }}>Tổng số văn bản</span>}
                            value={stats?.documentsCount || 0}
                            prefix={<FileOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{
                        background: 'linear-gradient(120deg, #f6ffed, #d9f7be)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(82, 196, 26, 0.15)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                    }}>
                        <Statistic
                            title={<span style={{ color: '#389e0d', fontWeight: 'bold' }}>Người dùng</span>}
                            value={stats?.usersCount || 0}
                            prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{
                        background: 'linear-gradient(120deg, #fff7e6, #ffe7ba)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(250, 140, 22, 0.15)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                    }}>
                        <Statistic
                            title={<span style={{ color: '#d46b08', fontWeight: 'bold' }}>Tin tức</span>}
                            value={stats?.newsCount || 0}
                            prefix={<NotificationOutlined style={{ color: '#fa8c16' }} />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card style={{
                        background: 'linear-gradient(120deg, #fff0f6, #ffadd2)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(235, 47, 150, 0.15)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                    }}>
                        <Statistic
                            title={<span style={{ color: '#c41d7f', fontWeight: 'bold' }}>Lượt xem</span>}
                            value={stats?.totalViews || 0}
                            prefix={<EyeOutlined style={{ color: '#eb2f96' }} />}
                            valueStyle={{ color: '#eb2f96' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col xs={24} md={12}>
                    <Card
                        title="Tin tức mới nhất"
                        extra={<Link to="/portal/news">Xem tất cả</Link>}
                        style={{
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255, 255, 255, 0.5)'
                        }}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={latestNews}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<Link to={`/portal/news/${item.id}`}>{item.title}</Link>}
                                        description={
                                            <Space direction="vertical" size={0}>
                                                <Text type="secondary">{item.summary}</Text>
                                                <Text type="secondary">
                                                    {moment(item.createdAt).format('DD/MM/YYYY HH:mm')}
                                                </Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card
                        title="Tài liệu mới nhất"
                        extra={<Link to="/portal/documents">Xem tất cả</Link>}
                        style={{
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255, 255, 255, 0.5)'
                        }}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={latestDocuments}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<Link to={`/portal/documents/${item.id}`}>{item.title}</Link>}
                                        description={
                                            <Space direction="vertical" size={0}>
                                                <Text type="secondary">{item.description}</Text>
                                                <Text type="secondary">
                                                    {moment(item.createdAt).format('DD/MM/YYYY HH:mm')}
                                                </Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
