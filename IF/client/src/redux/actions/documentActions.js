import axios from 'axios';
import {
    GET_DOCUMENTS,
    GET_DOCUMENT,
    ADD_DOCUMENT,
    UPDATE_DOCUMENT,
    DELETE_DOCUMENT,
    DOCUMENT_ERROR,
    DOWNLOAD_DOCUMENT,
    PREVIEW_DOCUMENT
} from '../types';
import { setAlert } from './alertActions';

// Lấy danh sách tài liệu
export const getDocuments = (page = 1, limit = 10, category = '', departmentId = '', search = '') => async dispatch => {
    try {
        let url = `/api/documents?page=${page}&limit=${limit}`;

        if (category) {
            url += `&category=${category}`;
        }

        if (departmentId) {
            url += `&departmentId=${departmentId}`;
        }

        if (search) {
            url += `&search=${search}`;
        }

        const res = await axios.get(url);

        dispatch({
            type: GET_DOCUMENTS,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: DOCUMENT_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi tải danh sách tài liệu'
        });
    }
};

// Lấy thông tin tài liệu
export const getDocument = id => async dispatch => {
    try {
        const res = await axios.get(`/api/documents/${id}`);

        dispatch({
            type: GET_DOCUMENT,
            payload: res.data.data
        });
    } catch (err) {
        dispatch({
            type: DOCUMENT_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi tải thông tin tài liệu'
        });
    }
};

// Tải lên tài liệu mới
export const addDocument = (formData, navigate) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        const res = await axios.post('/api/documents', formData, config);

        dispatch({
            type: ADD_DOCUMENT,
            payload: res.data.data
        });

        dispatch(setAlert('Tải lên tài liệu thành công', 'success'));

        navigate('/portal/documents'); // Updated path
    } catch (err) {
        dispatch({
            type: DOCUMENT_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi tải lên tài liệu'
        });

        dispatch(setAlert('Lỗi khi tải lên tài liệu', 'error'));
    }
};

// Cập nhật thông tin tài liệu
export const updateDocument = (id, formData) => async dispatch => {
    try {
        const res = await axios.put(`/api/documents/${id}`, formData);

        dispatch({
            type: UPDATE_DOCUMENT,
            payload: res.data.data
        });

        dispatch(setAlert('Cập nhật thông tin tài liệu thành công', 'success'));
    } catch (err) {
        dispatch({
            type: DOCUMENT_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi cập nhật thông tin tài liệu'
        });

        dispatch(setAlert('Lỗi khi cập nhật thông tin tài liệu', 'error'));
    }
};

// Xóa tài liệu
export const deleteDocument = id => async dispatch => {
    try {
        await axios.delete(`/api/documents/${id}`);

        dispatch({
            type: DELETE_DOCUMENT,
            payload: id
        });

        dispatch(setAlert('Xóa tài liệu thành công', 'success'));
    } catch (err) {
        dispatch({
            type: DOCUMENT_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi xóa tài liệu'
        });

        dispatch(setAlert('Lỗi khi xóa tài liệu', 'error'));
    }
};

// Tải xuống tài liệu
export const downloadDocument = id => async dispatch => {
    try {
        // Thay đổi cách tải xuống - sử dụng blob và tạo link tải xuống ngay trong trang
        const response = await axios.get(`/api/documents/${id}/download`, {
            responseType: 'blob' // Quan trọng - nhận dữ liệu dạng blob
        });

        // Tạo URL từ blob
        const url = window.URL.createObjectURL(new Blob([response.data]));

        // Lấy tên file từ headers nếu có
        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'download'; // Mặc định

        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
            if (fileNameMatch && fileNameMatch.length > 1) {
                fileName = fileNameMatch[1];
            }
        }

        // Tạo thẻ a tạm thời
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); // Đặt tên file
        document.body.appendChild(link); // Thêm link vào body

        // Kích hoạt sự kiện click
        link.click();

        // Dọn dẹp
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        dispatch({
            type: DOWNLOAD_DOCUMENT,
            payload: { id }
        });
    } catch (err) {
        dispatch({
            type: DOCUMENT_ERROR,
            payload: 'Lỗi khi tải xuống tài liệu'
        });

        dispatch(setAlert('Lỗi khi tải xuống tài liệu', 'error'));
    }
};

// Xem trước tài liệu
export const previewDocument = (id) => async dispatch => {
    try {
        // Open preview in a new tab or modal depending on file type
        window.open(`/api/documents/${id}/preview`, '_blank');

        dispatch({
            type: PREVIEW_DOCUMENT,
            payload: { id }
        });
    } catch (err) {
        dispatch({
            type: DOCUMENT_ERROR,
            payload: 'Lỗi khi xem trước tài liệu'
        });

        dispatch(setAlert('Lỗi khi xem trước tài liệu', 'error'));
    }
};
