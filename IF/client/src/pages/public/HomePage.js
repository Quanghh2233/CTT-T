import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Layout,
    Typography,
    Card,
    Button,
    Row,
    Col,
    Space,
    Tag,
    Input,
    Select,
    Divider,
    Skeleton,
    Empty,
    Avatar,
    Pagination
} from 'antd';
import {
    LoginOutlined,
    SearchOutlined,
    CalendarOutlined,
    UserOutlined,
    EyeOutlined,
    TagOutlined
} from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/vi';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { Meta } = Card;

moment.locale('vi');

// News categories
const NEWS_CATEGORIES = [
    { value: 'announcement', label: 'Thông báo', color: 'blue' },
    { value: 'policy', label: 'Chính sách', color: 'green' },
    { value: 'event', label: 'Sự kiện', color: 'magenta' },
    { value: 'training', label: 'Đào tạo', color: 'orange' },
    { value: 'other', label: 'Khác', color: 'default' }
];

const HomePage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 9,
        total: 0
    });
    const [searchText, setSearchText] = useState('');
    const [category, setCategory] = useState('');
    const [selectedNews, setSelectedNews] = useState(null);
    const [newsLoading, setNewsLoading] = useState(false);
    const navigate = useNavigate();

    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/api/news/public?page=${pagination.current}&limit=${pagination.pageSize}`;

            if (category) {
                url += `&category=${category}`;
            }

            if (searchText) {
                url += `&search=${searchText}`;
            }

            const response = await axios.get(url);
            setNews(response.data.data);
            setPagination({
                ...pagination,
                total: response.data.count
            });
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, category, searchText]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const fetchNewsDetail = async (id) => {
        setNewsLoading(true);
        try {
            const response = await axios.get(`/api/news/public/${id}`);
            setSelectedNews(response.data.data);
        } catch (error) {
            console.error('Error fetching news detail:', error);
        } finally {
            setNewsLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setPagination({
            ...pagination,
            current: page,
        });
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        setPagination({
            ...pagination,
            current: 1,
        });
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPagination({
            ...pagination,
            current: 1,
        });
    };

    const getCategoryTag = (categoryValue) => {
        const category = NEWS_CATEGORIES.find(c => c.value === categoryValue) || NEWS_CATEGORIES[4];
        return <Tag color={category.color}>{category.label}</Tag>;
    };

    const renderNewsList = () => (
        <>
            <Row gutter={[16, 16]}>
                {news.map(item => (
                    <Col xs={24} sm={12} md={6} key={item.id}>  {/* Changed md from 8 to 6 for 4 cards per row */}
                        <Card
                            hoverable
                            cover={
                                item.thumbnail ? (
                                    <img
                                        alt={item.title}
                                        src={`/uploads/thumbnails/${item.thumbnail}`}
                                        style={{ height: 180, objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{
                                        height: 180,
                                        background: '#f0f2f5',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        color: '#aaa'
                                    }}>
                                        Không có hình ảnh
                                    </div>
                                )
                            }
                            onClick={() => fetchNewsDetail(item.id)}
                        >
                            <Meta
                                title={<div style={{ fontSize: '14px', fontWeight: 'bold', height: '40px', overflow: 'hidden' }}>{item.title}</div>}
                                description={
                                    <>
                                        <div style={{ marginBottom: 8, height: '40px', overflow: 'hidden' }}>
                                            {item.summary?.length > 60
                                                ? `${item.summary.substring(0, 60)}...`
                                                : item.summary || 'Không có tóm tắt'}
                                        </div>
                                        <Space split={<Divider type="vertical" />}>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                <CalendarOutlined /> {moment(item.createdAt).format('DD/MM/YYYY')}
                                            </Text>
                                            {getCategoryTag(item.category)}
                                        </Space>
                                    </>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {!loading && news.length === 0 && (
                <Empty description="Không có tin tức nào" />
            )}

            <Row justify="center" style={{ marginTop: 24 }}>
                <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                />
            </Row>
        </>
    );

    const renderNewsDetail = () => {
        if (newsLoading) {
            return <Skeleton active paragraph={{ rows: 10 }} />;
        }

        return (
            <Card>
                <Button
                    type="link"
                    icon={<SearchOutlined />}
                    style={{ padding: 0, marginBottom: 16 }}
                    onClick={() => setSelectedNews(null)}
                >
                    Quay lại danh sách tin tức
                </Button>

                {selectedNews.thumbnail && (
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <img
                            src={`/uploads/thumbnails/${selectedNews.thumbnail}`}
                            alt={selectedNews.title}
                            style={{ maxWidth: '100%', maxHeight: 400 }}
                        />
                    </div>
                )}

                <Title level={2}>{selectedNews.title}</Title>

                <Space split={<Divider type="vertical" />} wrap style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                        <CalendarOutlined /> {moment(selectedNews.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Text>
                    <Text type="secondary">
                        <EyeOutlined /> {selectedNews.views} lượt xem
                    </Text>
                    <Text type="secondary">
                        <TagOutlined /> {getCategoryTag(selectedNews.category)}
                    </Text>
                </Space>

                {selectedNews.summary && (
                    <Paragraph
                        style={{
                            backgroundColor: '#f5f5f5',
                            padding: 16,
                            borderRadius: 4,
                            fontStyle: 'italic',
                            marginBottom: 24
                        }}
                    >
                        {selectedNews.summary}
                    </Paragraph>
                )}

                <div className="news-content" dangerouslySetInnerHTML={{ __html: selectedNews.content }} />

                <Divider />

                {selectedNews.author && (
                    <Space align="center">
                        <Avatar
                            size="large"
                            icon={<UserOutlined />}
                            src={selectedNews.author?.avatar ? `/uploads/avatars/${selectedNews.author.avatar}` : null}
                        />
                        <div>
                            <Text strong>Tác giả: {selectedNews.author?.fullName || 'Không xác định'}</Text>
                        </div>
                    </Space>
                )}
            </Card>
        );
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <Layout className="layout">
            <Header style={{
                background: 'linear-gradient(to right, #1890ff, #0056b3)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                padding: '0 50px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="logo" style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src="/logo.png"
                        alt="Bộ Tài Chính"
                        style={{ height: 45, marginRight: 15 }}
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <Title level={3} style={{ margin: 0, color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>BỘ TÀI CHÍNH</Title>
                </div>
                <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    onClick={handleLoginClick}
                    style={{
                        background: 'white',
                        color: '#1890ff',
                        borderColor: 'white',
                        fontWeight: 'bold'
                    }}
                >
                    Đăng nhập
                </Button>
            </Header>

            <Content style={{ padding: '0 50px', marginTop: 24 }}>
                {!selectedNews ? (
                    <>
                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff, #e6f7ff)',
                            padding: '30px',
                            marginBottom: 24,
                            borderRadius: '10px',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.5)'
                        }}>
                            <Title level={2} style={{
                                textAlign: 'center',
                                background: 'linear-gradient(45deg, #0056b3, #1890ff)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '1px 1px 2px rgba(255,255,255,0.5)'
                            }}>
                                Chào mừng đến với Cổng thông tin điện tử của Bộ Tài Chính
                            </Title>
                        </div>

                        <Card
                            style={{
                                marginBottom: 24,
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.5)'
                            }}
                            className="content-container"
                        >
                            <Row gutter={16}>
                                <Col xs={24} md={16}>
                                    <Search
                                        placeholder="Tìm kiếm thông tin..."
                                        allowClear
                                        enterButton={<SearchOutlined />}
                                        size="large"
                                        onSearch={handleSearch}
                                    />
                                </Col>
                                <Col xs={24} md={8}>
                                    <Select
                                        placeholder="Lọc theo danh mục"
                                        style={{ width: '100%' }}
                                        allowClear
                                        onChange={handleCategoryChange}
                                        size="large"
                                    >
                                        {NEWS_CATEGORIES.map(cat => (
                                            <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                                        ))}
                                    </Select>
                                </Col>
                            </Row>
                        </Card>

                        <div style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: 24,
                            borderRadius: '10px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                            backdropFilter: 'blur(10px)'
                        }} className="content-container">
                            <Title level={3}>TIN TỨC & THÔNG BÁO</Title>
                            <Divider />
                            {loading ? <Skeleton active paragraph={{ rows: 10 }} /> : renderNewsList()}
                        </div>
                    </>
                ) : (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: 24,
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(10px)'
                    }} className="content-container">
                        {renderNewsDetail()}
                    </div>
                )}
            </Content>

            <Footer style={{
                textAlign: 'center',
                background: 'linear-gradient(to right, #0c2461, #1e3799)',
                color: '#fff',
                padding: '24px 50px',
                marginTop: 24
            }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={8}>
                        <Title level={4} style={{ color: '#fff' }}>Bộ Tài Chính</Title>
                        <Paragraph style={{ color: '#ccc' }}>
                            Địa chỉ: 28 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội
                        </Paragraph>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Title level={4} style={{ color: '#fff' }}>Liên hệ</Title>
                        <Paragraph style={{ color: '#ccc' }}>
                            Email: banbientap@mof.gov.vn<br />
                            Điện thoại: (024) 22202828
                        </Paragraph>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Title level={4} style={{ color: '#fff' }}>Giờ làm việc</Title>
                        <Paragraph style={{ color: '#ccc' }}>
                            Thứ 2 - Thứ 6: 8:00 - 17:00<br />
                            Nghỉ: Thứ 7, Chủ nhật và các ngày lễ
                        </Paragraph>
                    </Col>
                </Row>
                <Divider style={{ borderColor: '#333' }} />
                <Text style={{ color: '#ccc' }}>
                    Cổng thông tin điện tử nội bộ Bộ Tài Chính © {new Date().getFullYear()}
                </Text>
            </Footer>
        </Layout>
    );
};

export default HomePage;