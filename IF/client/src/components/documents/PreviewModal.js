import React from 'react';
import { Modal } from 'antd';

const PreviewModal = ({ visible, onCancel, document }) => {
    if (!document) return null;

    const getPreviewContent = () => {
        const previewUrl = `/api/documents/${document.id}/preview`;

        if (document.fileType.includes('pdf')) {
            return (
                <iframe
                    src={previewUrl}
                    style={{
                        width: '100%',
                        height: 'calc(100vh - 200px)',
                        border: 'none'
                    }}
                    title="Document Preview"
                />
            );
        }

        if (document.fileType.includes('image')) {
            return (
                <img
                    src={previewUrl}
                    alt={document.title}
                    style={{
                        maxWidth: '100%',
                        maxHeight: 'calc(100vh - 200px)',
                        objectFit: 'contain'
                    }}
                />
            );
        }

        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                Định dạng file không hỗ trợ xem trước trực tiếp.<br />
                Vui lòng tải xuống để xem.
            </div>
        );
    };

    return (
        <Modal
            title={document.title}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width="80%"
            style={{ top: 20 }}
        >
            {getPreviewContent()}
        </Modal>
    );
};

export default PreviewModal;
