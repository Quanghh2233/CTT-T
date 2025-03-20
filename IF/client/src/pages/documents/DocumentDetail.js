import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Card,
    Button,
    Typography,
    Space,
    Descriptions,
    Tag,
    Statistic,
    Skeleton,
    Divider,
    Row,
    Col,
    Popconfirm,
    message
} from 'antd';
import {
    DownloadOutlined,
    FileOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    DeleteOutlined,
    EditOutlined,
    ArrowLeftOutlined,
    EyeOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import {
    getDocument,
    downloadDocument,
    deleteDocument,
    previewDocument
} from '../../redux/actions/documentActions';
import moment from 'moment';
import 'moment/locale/vi';

const { Title, Text } = Typography;
moment.locale('vi');

// Danh mục tài liệu
const DOCUMENT_CATEGORIES = [
    { value: 'regulation', label: 'Quy định/Quy chế' },
    { value: 'report', label: 'Báo cáo' },
    { value: 'form', label: 'Biểu mẫu' },
    { value: 'plan', label: 'Kế hoạch' },
    { value: 'official', label: 'Văn bản chính thức' },
    { value: 'other', label: 'Khác' }
];

const DocumentDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentDocument, loading } = useSelector(state => state.document);
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(getDocument(id));
    }, [dispatch, id]);

    const isAdmin = user && user.role === 'admin';
    const isOwner = currentDocument && currentDocument.uploader && user && currentDocument.uploader.id === user.id;
    const canManage = isAdmin || isOwner;

    const getCategoryLabel = (categoryValue) => {
        const category = DOCUMENT_CATEGORIES.find(c => c.value === categoryValue);
        return category ? category.label : categoryValue;
    };

    const handleDownload = () => {
        dispatch(downloadDocument(id));
    };

    const handleDelete = async () => {
        try {
            await dispatch(deleteDocument(id));
            message.success('Xóa tài liệu thành công');
            navigate('/documents');
        } catch (error) {
            message.error('Không thể xóa tài liệu');
        }
    };

    const handleEdit = () => {
        navigate(`/documents/edit/${id}`);
    };

    const handlePreview = () => {
        dispatch(previewDocument(id));
    };

    const getDocumentIcon = () => {
        if (!currentDocument) return <FileOutlined style={{ fontSize: 64 }} />;

        const fileType = currentDocument.fileType;
        if (fileType.includes('pdf')) {
            return <FilePdfOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />;
        } else if (fileType.includes('word') || fileType.includes('doc')) {
            return <FileWordOutlined style={{ fontSize: 64, color: '#1890ff' }} />;
        } else if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('xls')) {
            return <FileExcelOutlined style={{ fontSize: 64, color: '#52c41a' }} />;
        } else {
            return <FileOutlined style={{ fontSize: 64 }} />;
        }
    };

    if (loading || !currentDocument) {
        return (
            <div>
                <Skeleton active paragraph={{ rows: 6 }} />
            </div>
        );
    }

    return (
        <div>
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                style={{ marginBottom: 16, padding: 0 }}
                onClick={() => navigate('/portal/documents')}
            >
                Quay lại danh sách tài liệu
            </Button>

            <Card>
                <Row gutter={24}>
                    <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: 16 }}>
                            {getDocumentIcon()}
                        </div>
                        <Text strong>{currentDocument.fileName}</Text>
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">
                                {(currentDocument.fileSize / 1024).toFixed(2)} KB
                            </Text>
                        </div>
                        <Divider />
                        <Button
                            icon={<EyeOutlined />}
                            onClick={handlePreview}
                            style={{ marginBottom: 8 }}
                            block
                        >
                            Xem trước
                        </Button>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleDownload}
                            block
                        >
                            Tải xuống
                        </Button>

                        {canManage && (
                            <div style={{ marginTop: 16 }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={handleEdit}
                                        block
                                    >
                                        Chỉnh sửa
                                    </Button>
                                    <Popconfirm
                                        title="Bạn có chắc chắn muốn xóa tài liệu này?"
                                        onConfirm={handleDelete}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            block
                                        >
                                            Xóa tài liệu
                                        </Button>
                                    </Popconfirm>
                                </Space>
                            </div>
                        )}
                    </Col>

                    <Col xs={24} sm={18}>
                        <Title level={2}>{currentDocument.title}</Title>

                        <Space style={{ marginBottom: 16 }}>
                            <Tag color={currentDocument.isPublic ? 'green' : 'orange'}>
                                {currentDocument.isPublic ? 'Công khai' : 'Nội bộ'}
                            </Tag>
                            <Tag>{getCategoryLabel(currentDocument.category)}</Tag>
                        </Space>

                        {currentDocument.description && (
                            <div style={{ marginBottom: 24 }}>
                                <Text>{currentDocument.description}</Text>
                            </div>
                        )}

                        <Divider />

                        <Descriptions column={{ xs: 1, sm: 2 }}>
                            <Descriptions.Item label="Phòng ban">
                                {currentDocument.Department?.name || 'Không xác định'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Người đăng">
                                {currentDocument.uploader?.fullName || 'Không xác định'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tải lên">
                                <Space>
                                    <CalendarOutlined />
                                    {moment(currentDocument.createdAt).format('DD/MM/YYYY HH:mm')}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Cập nhật">
                                {moment(currentDocument.updatedAt).format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Row gutter={16}>
                            <Col xs={12}>
                                <Statistic
                                    title="Lượt tải xuống"
                                    value={currentDocument.downloadCount}
                                    prefix={<DownloadOutlined />}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default DocumentDetail;
