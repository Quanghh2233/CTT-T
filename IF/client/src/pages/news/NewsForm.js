import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Form,
    Input,
    Button,
    Card,
    Select,
    Upload,
    Switch,
    Divider,
    Typography,
    Row,
    Col,
    message,
    Spin,
    Space
} from 'antd';
import {
    UploadOutlined,
    SaveOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { addNews, updateNews, getNewsDetail } from '../../redux/actions/newsActions';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Danh mục tin tức
const NEWS_CATEGORIES = [
    { value: 'announcement', label: 'Thông báo' },
    { value: 'policy', label: 'Chính sách' },
    { value: 'event', label: 'Sự kiện' },
    { value: 'training', label: 'Đào tạo' },
    { value: 'other', label: 'Khác' }
];

// Cấu hình ReactQuill
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['link', 'image'],
        [{ color: [] }, { background: [] }],
        ['clean']
    ]
};

const NewsForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const { currentNews, loading } = useSelector(state => state.news);

    const [content, setContent] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setIsEditing(!!id);
        if (id) {
            dispatch(getNewsDetail(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (isEditing && currentNews) {
            form.setFieldsValue({
                title: currentNews.title,
                category: currentNews.category,
                summary: currentNews.summary,
                isPublished: currentNews.isPublished
            });
            setContent(currentNews.content);

            if (currentNews.thumbnail) {
                setThumbnailPreview(`/uploads/thumbnails/${currentNews.thumbnail}`);
            }
        }
    }, [form, isEditing, currentNews]);

    const handleSubmit = async (values) => {
        setIsSubmitting(true);

        try {
            // Tạo FormData để gửi cả thông tin và file
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('category', values.category);
            formData.append('summary', values.summary || '');
            formData.append('content', content);
            formData.append('isPublished', values.isPublished);

            if (thumbnailFile) {
                formData.append('thumbnail', thumbnailFile);
            }

            if (isEditing) {
                await dispatch(updateNews(id, formData, navigate));
            } else {
                await dispatch(addNews(formData, navigate));
            }
        } catch (error) {
            console.error('Submit form error:', error);
            message.error('Không thể lưu tin tức');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleThumbnailChange = ({ file }) => {
        if (file.status === 'done' || file.status === 'uploading') {
            return;
        }

        setThumbnailFile(file);

        // Hiển thị preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setThumbnailPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const renderUploadButton = () => {
        return (
            <div>
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                <div style={{ marginTop: 8 }}>
                    Hỗ trợ JPG, PNG, GIF (max: 10MB)
                </div>
            </div>
        );
    };

    // Ensure we navigate using the portal prefix
    const handleCancel = () => {
        navigate('/portal/news');
    };

    if (isEditing && loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    return (
        <div>
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                style={{ marginBottom: 16, padding: 0 }}
                onClick={handleCancel}
            >
                Quay lại danh sách tin tức
            </Button>

            <Card>
                <Title level={2}>{isEditing ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}</Title>
                <Divider />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        isPublished: true,
                        category: 'announcement'
                    }}
                >
                    <Row gutter={24}>
                        <Col xs={24} md={16}>
                            <Form.Item
                                name="title"
                                label="Tiêu đề"
                                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                            >
                                <Input size="large" placeholder="Nhập tiêu đề tin tức" />
                            </Form.Item>

                            <Form.Item
                                name="summary"
                                label="Tóm tắt"
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Nhập tóm tắt nội dung (không bắt buộc)"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Nội dung"
                                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                            >
                                <ReactQuill
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    modules={quillModules}
                                    style={{ height: 300, marginBottom: 40 }}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                            <Form.Item
                                name="category"
                                label="Danh mục"
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                            >
                                <Select placeholder="Chọn danh mục">
                                    {NEWS_CATEGORIES.map(cat => (
                                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="thumbnail"
                                label="Ảnh đại diện"
                            >
                                <Upload
                                    beforeUpload={() => false}
                                    onChange={handleThumbnailChange}
                                    showUploadList={false}
                                >
                                    <div style={{ marginBottom: 8 }}>
                                        {thumbnailPreview && (
                                            <div style={{ marginBottom: 16 }}>
                                                <img
                                                    src={thumbnailPreview}
                                                    alt="Thumbnail"
                                                    style={{ maxWidth: '100%', maxHeight: 200 }}
                                                />
                                            </div>
                                        )}
                                        {renderUploadButton()}
                                    </div>
                                </Upload>
                            </Form.Item>

                            <Form.Item
                                name="isPublished"
                                label="Xuất bản"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Công khai" unCheckedChildren="Nháp" />
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                        size="large"
                                        loading={isSubmitting}
                                    >
                                        {isEditing ? 'Cập nhật' : 'Đăng tin'}
                                    </Button>
                                    <Button size="large" onClick={handleCancel}>
                                        Hủy
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default NewsForm;
