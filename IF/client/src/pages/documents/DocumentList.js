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
    Upload,
    Tooltip,
    Popconfirm,
    message,
    Row,
    Col,
    Card,
    Divider
} from 'antd';
import {
    FileOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    DownloadOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
    UploadOutlined,
    EyeOutlined
} from '@ant-design/icons';
import {
    getDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
} from '../../redux/actions/documentActions';
import { getDepartments } from '../../redux/actions/departmentActions';
import moment from 'moment';
import 'moment/locale/vi';
import PreviewModal from '../../components/documents/PreviewModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;

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

const DocumentList = () => {
    const dispatch = useDispatch();
    const { documents, loading, pagination } = useSelector(state => state.document);
    const { departments } = useSelector(state => state.department);
    const { user } = useSelector(state => state.auth);

    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [documentFile, setDocumentFile] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [category, setCategory] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [page, setPage] = useState(1);
    const [modalLoading, setModalLoading] = useState(false);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);

    const isAdmin = user && user.role === 'admin';

    useEffect(() => {
        dispatch(getDocuments(page, 10, category, departmentId, searchText));
        dispatch(getDepartments());
    }, [dispatch, page, category, departmentId, searchText]);

    const showAddModal = () => {
        form.resetFields();
        setIsEditMode(false);
        setCurrentDocument(null);
        setDocumentFile(null);
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const handleDocumentSubmit = async (values) => {
        setModalLoading(true);
        try {
            if (isEditMode) {
                await dispatch(updateDocument(currentDocument.id, values));
                message.success('Cập nhật thông tin tài liệu thành công');
            } else {
                if (!documentFile) {
                    message.error('Vui lòng chọn một tệp tài liệu');
                    setModalLoading(false);
                    return;
                }

                const formData = new FormData();
                formData.append('title', values.title);
                formData.append('description', values.description || '');
                formData.append('category', values.category);
                formData.append('departmentId', values.departmentId);
                formData.append('isPublic', values.isPublic);
                formData.append('document', documentFile);

                await dispatch(addDocument(formData, () => {
                    setIsModalVisible(false);
                    dispatch(getDocuments(page, 10, category, departmentId, searchText));
                }));
                message.success('Tải lên tài liệu thành công');
            }
            setIsModalVisible(false);
            dispatch(getDocuments(page, 10, category, departmentId, searchText));
        } catch (error) {
            console.error('Document submission error:', error);
            message.error('Không thể lưu tài liệu');
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteDocument(id));
            dispatch(getDocuments(page, 10, category, departmentId, searchText));
        } catch (error) {
            console.error('Delete document error:', error);
            message.error('Không thể xóa tài liệu');
        }
    };

    const handleDownload = (id) => {
        dispatch(downloadDocument(id));
    };

    const handlePreview = async (document) => {
        setPreviewDocument(document);
        setPreviewModalVisible(true);
    };

    const handleFileChange = ({ file }) => {
        setDocumentFile(file);
    };

    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        setPage(1);
    };

    const handleDepartmentChange = (value) => {
        setDepartmentId(value);
        setPage(1);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(1);
    };

    const getDocumentIcon = (fileType) => {
        if (fileType.includes('pdf')) {
            return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
        } else if (fileType.includes('word') || fileType.includes('doc')) {
            return <FileWordOutlined style={{ color: '#1890ff' }} />;
        } else if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('xls')) {
            return <FileExcelOutlined style={{ color: '#52c41a' }} />;
        } else {
            return <FileOutlined />;
        }
    };

    const getCategoryLabel = (categoryValue) => {
        const category = DOCUMENT_CATEGORIES.find(c => c.value === categoryValue);
        return category ? category.label : categoryValue;
    };

    const columns = [
        {
            title: 'Tài liệu',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <Space>
                    {getDocumentIcon(record.fileType)}
                    <div>
                        <div>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {(record.fileSize / 1024).toFixed(2)} KB • {moment(record.createdAt).format('DD/MM/YYYY')}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: category => getCategoryLabel(category)
        },
        {
            title: 'Phòng ban',
            dataIndex: 'Department',
            key: 'department',
            render: dept => dept?.name || 'N/A'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isPublic',
            key: 'isPublic',
            render: isPublic => (
                <Tag color={isPublic ? 'green' : 'orange'}>
                    {isPublic ? 'Công khai' : 'Nội bộ'}
                </Tag>
            )
        },
        {
            title: 'Người đăng',
            dataIndex: 'uploader',
            key: 'uploader',
            render: uploader => uploader?.fullName || 'N/A'
        },
        {
            title: 'Lượt tải',
            dataIndex: 'downloadCount',
            key: 'downloadCount',
            align: 'center'
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                // Kiểm tra quyền
                const canManage = isAdmin || (record.uploader && record.uploader.id === user.id);

                return (
                    <Space size="small">
                        <Tooltip title="Xem trước">
                            <Button
                                icon={<EyeOutlined />}
                                size="small"
                                onClick={() => handlePreview(record)}
                            />
                        </Tooltip>
                        <Tooltip title="Tải xuống">
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                size="small"
                                onClick={() => handleDownload(record.id)}
                            />
                        </Tooltip>
                        {canManage && (
                            <>
                                <Tooltip title="Xóa">
                                    <Popconfirm
                                        title="Bạn có chắc chắn muốn xóa tài liệu này?"
                                        onConfirm={() => handleDelete(record.id)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            size="small"
                                        />
                                    </Popconfirm>
                                </Tooltip>
                            </>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Title level={2}>Quản lý Tài liệu</Title>
                </Col>
                <Col>
                    <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                        Tải lên tài liệu
                    </Button>
                </Col>
            </Row>

            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col xs={24} md={10}>
                        <Search
                            placeholder="Tìm kiếm tài liệu..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            onSearch={handleSearch}
                        />
                    </Col>
                    <Col xs={12} md={7}>
                        <Select
                            placeholder="Lọc theo danh mục"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={handleCategoryChange}
                        >
                            {DOCUMENT_CATEGORIES.map(cat => (
                                <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={12} md={7}>
                        <Select
                            placeholder="Lọc theo phòng ban"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={handleDepartmentChange}
                        >
                            {departments && departments.map(dept => (
                                <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Table
                columns={columns}
                dataSource={documents}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: pagination.currentPage,
                    pageSize: 10,
                    total: pagination.count,
                    onChange: handlePageChange
                }}
                expandable={{
                    expandedRowRender: record => (
                        <p style={{ margin: 0 }}>{record.description || 'Không có mô tả'}</p>
                    ),
                }}
            />

            <PreviewModal
                visible={previewModalVisible}
                onCancel={() => setPreviewModalVisible(false)}
                document={previewDocument}
            />

            <Modal
                title={isEditMode ? "Chỉnh sửa thông tin tài liệu" : "Tải lên tài liệu mới"}
                open={isModalVisible}
                onCancel={handleModalCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleDocumentSubmit}
                    initialValues={{
                        isPublic: false,
                        category: 'other'
                    }}
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề tài liệu"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề tài liệu' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Danh mục"
                        rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                    >
                        <Select placeholder="Chọn danh mục">
                            {DOCUMENT_CATEGORIES.map(cat => (
                                <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="departmentId"
                        label="Phòng ban"
                        rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
                    >
                        <Select placeholder="Chọn phòng ban">
                            {departments && departments.map(dept => (
                                <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {!isEditMode && (
                        <Form.Item
                            name="document"
                            label="Tệp tài liệu"
                            rules={[{ required: true, message: 'Vui lòng chọn tệp tài liệu' }]}
                        >
                            <Upload
                                beforeUpload={() => false}
                                onChange={handleFileChange}
                                maxCount={1}
                            >
                                <Button icon={<UploadOutlined />}>Chọn tệp</Button>
                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                    Hỗ trợ: PDF, Word, Excel (tối đa 10MB)
                                </Text>
                            </Upload>
                        </Form.Item>
                    )}

                    <Form.Item
                        name="isPublic"
                        label="Quyền truy cập"
                        valuePropName="checked"
                    >
                        <Select>
                            <Option value={false}>Nội bộ (chỉ phòng ban)</Option>
                            <Option value={true}>Công khai (tất cả người dùng)</Option>
                        </Select>
                    </Form.Item>

                    <Divider />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleModalCancel}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={modalLoading}>
                                {isEditMode ? 'Cập nhật' : 'Tải lên'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DocumentList;
