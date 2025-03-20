import React, { useEffect} from 'react';
import { useParams , useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Typography,
    Card,
    Space,
    Divider,
    Avatar,
    Button,
    Skeleton,
    Dropdown,
    Menu,
    Popconfirm,
    message,
    Alert
} from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    EyeOutlined,
    TagOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    CheckCircleOutlined,
    StopOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { getNewsDetail, deleteNews, togglePublishStatus } from '../../redux/actions/newsActions';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-quill/dist/quill.snow.css';

const { Title, Text, Paragraph } = Typography;

moment.locale('vi');

// Danh mục tin tức
const NEWS_CATEGORIES = [
    { value: 'announcement', label: 'Thông báo' },
    { value: 'policy', label: 'Chính sách' },
    { value: 'event', label: 'Sự kiện' },
    { value: 'training', label: 'Đào tạo' },
    { value: 'other', label: 'Khác' }
];

const NewsDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentNews, loading } = useSelector(state => state.news);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(getNewsDetail(id));
    }, [dispatch, id]);

    const isAdminOrManager = user && (user.role === 'admin' || user.role === 'manager');

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

    const handleDelete = async () => {
        try {
            await dispatch(deleteNews(id));
            message.success('Xóa tin tức thành công');
            navigate('/news');
        } catch (error) {
            message.error('Không thể xóa tin tức');
        }
    };

    const handleTogglePublish = async () => {
        await dispatch(togglePublishStatus(id));
        dispatch(getNewsDetail(id)); // Refresh detail
    };

    const handleEdit = () => {
        navigate(`/portal/news/edit/${id}`);
    };

    const actionMenu = (
        <Menu>
            <Menu.Item key="edit" icon={<EditOutlined />} onClick={handleEdit}>
                Chỉnh sửa
            </Menu.Item>

            {currentNews && (
                <Menu.Item
                    key="publish"
                    icon={currentNews.isPublished ? <StopOutlined /> : <CheckCircleOutlined />}
                    onClick={handleTogglePublish}
                >
                    {currentNews.isPublished ? 'Hủy xuất bản' : 'Xuất bản'}
                </Menu.Item>
            )}

            <Menu.Divider />
            <Menu.Item key="delete" danger icon={<DeleteOutlined />}>
                <Popconfirm
                    title="Bạn có chắc chắn muốn xóa tin tức này?"
                    onConfirm={handleDelete}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    Xóa tin tức
                </Popconfirm>
            </Menu.Item>
        </Menu>
    );

    const renderNewsDetail = () => {
        if (loading || !currentNews) {
            return <Skeleton active paragraph={{ rows: 10 }} />;
        }

        const canEdit = isAdminOrManager || (currentNews.author && user && currentNews.author.id === user.id);

        return (
            <div>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    style={{ marginBottom: 16, padding: 0 }}
                    onClick={() => navigate('/portal/news')}
                >
                    Quay lại danh sách tin tức
                </Button>

                <Card
                    title={<Title level={2}>{currentNews.title}</Title>}
                    extra={
                        canEdit && (
                            <Dropdown overlay={actionMenu} placement="bottomRight">
                                <Button icon={<MoreOutlined />} />
                            </Dropdown>
                        )
                    }
                >
                    {!currentNews.isPublished && (
                        <Alert
                            message="Tin tức chưa xuất bản"
                            description="Tin tức này hiện chỉ hiển thị cho quản trị viên và người tạo."
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Space split={<Divider type="vertical" />} wrap style={{ marginBottom: 16 }}>
                        <Text type="secondary">
                            <CalendarOutlined /> {moment(currentNews.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Text>
                        <Text type="secondary">
                            <EyeOutlined /> {currentNews.views} lượt xem
                        </Text>
                        <Text type="secondary">
                            <TagOutlined /> {getCategoryLabel(currentNews.category)}
                        </Text>
                    </Space>

                    {currentNews.summary && (
                        <Paragraph
                            style={{
                                backgroundColor: '#f5f5f5',
                                padding: 16,
                                borderRadius: 4,
                                fontStyle: 'italic',
                                marginBottom: 24
                            }}
                        >
                            {currentNews.summary}
                        </Paragraph>
                    )}

                    <div className="ql-editor" style={{ padding: 0 }}>
                        <div dangerouslySetInnerHTML={{ __html: currentNews.content }} />
                    </div>

                    <Divider />

                    <Space align="center">
                        <Avatar
                            size="large"
                            icon={<UserOutlined />}
                            src={currentNews.author?.avatar ? `/uploads/avatars/${currentNews.author.avatar}` : null}
                        />
                        <div>
                            <Text strong>Tác giả: {currentNews.author?.fullName || 'Không xác định'}</Text>
                        </div>
                    </Space>
                </Card>
            </div>
        );
    };

    return (
        <div>
            {renderNewsDetail()}
        </div>
    );
};

export default NewsDetail;
