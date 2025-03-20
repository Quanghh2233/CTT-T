import axios from 'axios';
import {
    GET_NEWS,
    GET_NEWS_DETAIL,
    ADD_NEWS,
    UPDATE_NEWS,
    DELETE_NEWS,
    NEWS_ERROR,
    CLEAR_NEWS
} from '../types';
import { setAlert } from './alertActions';

// Lấy danh sách tin tức
export const getNews = (page = 1, limit = 10, category = '', search = '') => async dispatch => {
    try {
        let url = `/api/news?page=${page}&limit=${limit}`;

        if (category) {
            url += `&category=${category}`;
        }

        if (search) {
            url += `&search=${search}`;
        }

        const res = await axios.get(url);

        dispatch({
            type: GET_NEWS,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: NEWS_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi tải tin tức'
        });
    }
};

// Lấy chi tiết tin tức
export const getNewsDetail = id => async dispatch => {
    try {
        dispatch({ type: CLEAR_NEWS });

        const res = await axios.get(`/api/news/${id}`);

        dispatch({
            type: GET_NEWS_DETAIL,
            payload: res.data.data
        });
    } catch (err) {
        dispatch({
            type: NEWS_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi tải chi tiết tin tức'
        });
    }
};

// Thêm tin tức mới
export const addNews = (formData, navigate) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        const res = await axios.post('/api/news', formData, config);

        dispatch({
            type: ADD_NEWS,
            payload: res.data.data
        });

        dispatch(setAlert('Tạo tin tức thành công', 'success'));

        navigate('/portal/news');
    } catch (err) {
        dispatch({
            type: NEWS_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi tạo tin tức'
        });

        dispatch(setAlert('Lỗi khi tạo tin tức', 'error'));
    }
};

// Cập nhật tin tức
export const updateNews = (id, formData, navigate) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        const res = await axios.put(`/api/news/${id}`, formData, config);

        dispatch({
            type: UPDATE_NEWS,
            payload: res.data.data
        });

        dispatch(setAlert('Cập nhật tin tức thành công', 'success'));

        navigate(`/portal/news/${id}`);
    } catch (err) {
        dispatch({
            type: NEWS_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi cập nhật tin tức'
        });

        dispatch(setAlert('Lỗi khi cập nhật tin tức', 'error'));
    }
};

// Xóa tin tức
export const deleteNews = id => async dispatch => {
    try {
        await axios.delete(`/api/news/${id}`);

        dispatch({
            type: DELETE_NEWS,
            payload: id
        });

        dispatch(setAlert('Xóa tin tức thành công', 'success'));
    } catch (err) {
        dispatch({
            type: NEWS_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi xóa tin tức'
        });

        dispatch(setAlert('Lỗi khi xóa tin tức', 'error'));
    }
};

// Thay đổi trạng thái xuất bản
export const togglePublishStatus = id => async dispatch => {
    try {
        const res = await axios.put(`/api/news/${id}/toggle-publish`);

        dispatch({
            type: UPDATE_NEWS,
            payload: res.data.data
        });

        dispatch(setAlert(res.data.message, 'success'));
    } catch (err) {
        dispatch({
            type: NEWS_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi thay đổi trạng thái'
        });

        dispatch(setAlert('Lỗi khi thay đổi trạng thái', 'error'));
    }
};
