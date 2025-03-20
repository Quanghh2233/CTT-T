import axios from 'axios';
import {
    GET_USERS,
    GET_USER,
    ADD_USER,
    UPDATE_USER,
    DELETE_USER,
    USER_ERROR
} from '../types';
import { setAlert } from './alertActions';

// Lấy danh sách người dùng
export const getUsers = () => async dispatch => {
    try {
        const res = await axios.get('/api/users');

        dispatch({
            type: GET_USERS,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: USER_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi tải danh sách người dùng'
        });
    }
};

// Lấy thông tin người dùng
export const getUser = id => async dispatch => {
    try {
        const res = await axios.get(`/api/users/${id}`);

        dispatch({
            type: GET_USER,
            payload: res.data.data
        });
    } catch (err) {
        dispatch({
            type: USER_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi tải thông tin người dùng'
        });
    }
};

// Thêm người dùng mới
export const addUser = (userData) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const res = await axios.post('/api/auth/register', userData, config);

        dispatch({
            type: ADD_USER,
            payload: res.data.data
        });

        dispatch(setAlert('Tạo người dùng thành công', 'success'));
        return true;
    } catch (err) {
        dispatch({
            type: USER_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi tạo người dùng'
        });

        dispatch(setAlert('Lỗi khi tạo người dùng', 'error'));
        return false;
    }
};

// Cập nhật thông tin người dùng
export const updateUser = (id, userData) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const res = await axios.put(`/api/users/${id}`, userData, config);

        dispatch({
            type: UPDATE_USER,
            payload: res.data.data
        });

        dispatch(setAlert('Cập nhật thông tin người dùng thành công', 'success'));
        return true;
    } catch (err) {
        dispatch({
            type: USER_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi cập nhật thông tin người dùng'
        });

        dispatch(setAlert('Lỗi khi cập nhật thông tin người dùng', 'error'));
        return false;
    }
};

// Xóa người dùng
export const deleteUser = id => async dispatch => {
    try {
        await axios.delete(`/api/users/${id}`);

        dispatch({
            type: DELETE_USER,
            payload: id
        });

        dispatch(setAlert('Xóa người dùng thành công', 'success'));
    } catch (err) {
        dispatch({
            type: USER_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi xóa người dùng'
        });

        dispatch(setAlert('Lỗi khi xóa người dùng', 'error'));
    }
};

// Thay đổi trạng thái người dùng
export const toggleUserStatus = id => async dispatch => {
    try {
        const res = await axios.put(`/api/users/${id}/toggle-status`);

        dispatch({
            type: UPDATE_USER,
            payload: res.data.data
        });

        dispatch(setAlert(res.data.message, 'success'));
    } catch (err) {
        dispatch({
            type: USER_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi thay đổi trạng thái người dùng'
        });

        dispatch(setAlert('Lỗi khi thay đổi trạng thái người dùng', 'error'));
    }
};
