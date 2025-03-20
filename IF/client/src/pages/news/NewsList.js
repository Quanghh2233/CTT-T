import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    List,
    Card,
    Space,
    Typography,
    Button,
    Tag,
    Pagination,
    Input,
    Select,
    Row,
    Col,
    Divider,
    Dropdown,
    Menu,
    Popconfirm,
    message,
    Empty
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined,
    MoreOutlined,
    CheckCircleOutlined,
    StopOutlined,
    CalendarOutlined,
    UserOutlined
} from '@ant-design/icons';
import { getNews, deleteNews, togglePublishStatus } from '../../redux/actions/newsActions';
import moment from 'moment';
import 'moment/locale/vi';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

moment.locale('vi');

// Danh mục tin tức
const NEWS_CATEGORIES = [
    { value: 'announcement', label: 'Thông báo' },
    { value: 'policy', label: 'Chính sách' },
    { value: 'event', label: 'Sự kiện' },
    { value: 'training', label: 'Đào tạo' },
    { value: 'other', label: 'Khác' }
];

const NewsList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { news, loading, pagination } = useSelector(state => state.news);
    const { user } = useSelector(state => state.auth);
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState('');
    const [searchText, setSearchText] = useState('');

    const isAdminOrManager = user && (user.role === 'admin' || user.role === 'manager');

    useEffect(() => {
        dispatch(getNews(page, 10, category, searchText));
    }, [dispatch, page, category, searchText]);

    const handlePageChange = (page) => {
        setPage(page);
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        setPage(1);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(1);
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteNews(id));
            // Refresh list
            dispatch(getNews(page, 10, category, searchText));
        } catch (error) {
            message.error('Không thể xóa tin tức');
        }
    };

    const handleTogglePublish = async (id) => {
        await dispatch(togglePublishStatus(id));
        // Refresh list
        dispatch(getNews(page, 10, category, searchText));
    };

    // Update the navigation paths for edit to include the portal prefix
    const handleEditNews = (id) => {
        navigate(`/portal/news/edit/${id}`);
    };

    const renderNewsActions = (item) => {
        // Kiểm tra quyền chỉnh sửa (admin hoặc tác giả)
        const canEdit = isAdminOrManager || (item.author && item.author.id === user.id);

        if (!canEdit) return null;

        const menu = (
            <Menu>
                <Menu.Item
                    key="edit"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleEditNews(item.id);
                    }}
                >
                    Chỉnh sửa
                </Menu.Item>
                <Menu.Item
                    key="publish"
                    icon={item.isPublished ? <StopOutlined /> : <CheckCircleOutlined />}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        handleTogglePublish(item.id);
                    }}
                >
                    {item.isPublished ? 'Hủy xuất bản' : 'Xuất bản'}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="delete" danger icon={<DeleteOutlined />}>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa tin tức này?"
                        onConfirm={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleDelete(item.id);
                        }}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        Xóa tin tức
                    </Popconfirm>
                </Menu.Item>
            </Menu>
        );

        return (
            <Dropdown
                overlay={menu}
                trigger={['click']}
                onClick={e => e.stopPropagation()} // Prevent card click
            >
                <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
        );
    };

    const getCategoryLabel = (categoryValue) => {
        const category = NEWS_CATEGORIES.find(c => c.value === categoryValue);
        return category ? category.label : categoryValue;
    };

    const getCategoryColor = (category) => {
        const categoryMap = {
            'announcement': 'blue',
            'policy': 'green',
            'event': 'magenta',
            'training': 'orange',
            'other': 'default'
        };

        return categoryMap[category] || 'default';
    };

    return (
        <div>
            <Row gutter={16} align="middle" justify="space-between">
                <Col>
                    <Title level={2}>Tin tức & Thông báo</Title>
                </Col>
                {isAdminOrManager && (
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/portal/news/create')}
                        >
                            Thêm tin tức
                        </Button>
                    </Col>
                )}
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={24} md={8}>
                    <Search
                        placeholder="Tìm kiếm tin tức..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={handleSearch}
                    />
                </Col>
                <Col xs={24} md={6}>
                    <Select
                        placeholder="Lọc theo danh mục"
                        style={{ width: '100%' }}
                        allowClear
                        onChange={handleCategoryChange}
                    >
                        {NEWS_CATEGORIES.map(cat => (
                            <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                        ))}
                    </Select>
                </Col>
            </Row>

            <Divider />

            {news?.length === 0 ? (
                <Empty description="Không có tin tức nào" />
            ) : (
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 1,
                        md: 2,
                        lg: 3,
                        xl: 3,
                        xxl: 4,
                    }}
                    dataSource={news}
                    loading={loading}
                    renderItem={item => (
                        <List.Item>
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
                                actions={[
                                    <Link
                                        to={`/portal/news/${item.id}`}
                                        key="view"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <EyeOutlined /> Xem
                                    </Link>,
                                    renderNewsActions(item)
                                ].filter(Boolean)}
                                onClick={() => navigate(`/portal/news/${item.id}`)}
                            >
                                <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                                    {!item.isPublished && <Tag color="red">Chưa xuất bản</Tag>}
                                    <Tag color={getCategoryColor(item.category)}>
                                        {getCategoryLabel(item.category)}
                                    </Tag>
                                </div>
                                <Card.Meta
                                    title={<Link to={`/portal/news/${item.id}`}>{item.title}</Link>}
                                    description={
                                        <>
                                            <div style={{ marginBottom: 8 }}>
                                                {item.summary?.length > 100
                                                    ? `${item.summary.substring(0, 100)}...`
                                                    : item.summary || 'Không có tóm tắt'}
                                            </div>
                                            <Space split={<Divider type="vertical" />}>
                                                <Text type="secondary">
                                                    <CalendarOutlined /> {moment(item.createdAt).format('DD/MM/YYYY')}
                                                </Text>
                                                {item.author && (
                                                    <Text type="secondary">
                                                        <UserOutlined /> {item.author.fullName}
                                                    </Text>
                                                )}
                                                <Text type="secondary">
                                                    <EyeOutlined /> {item.views}
                                                </Text>
                                            </Space>
                                        </>
                                    }
                                />
                            </Card>
                        </List.Item>
                    )}
                />
            )}

            <Row justify="center" style={{ marginTop: 16 }}>
                <Pagination
                    current={pagination.currentPage}
                    pageSize={10}
                    total={pagination.count}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                />
            </Row>
        </div>
    );
};

export default NewsList;
