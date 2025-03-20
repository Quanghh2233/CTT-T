import axios from 'axios';
import {
    GET_DEPARTMENTS,
    GET_DEPARTMENT,
    ADD_DEPARTMENT,
    UPDATE_DEPARTMENT,
    DELETE_DEPARTMENT,
    DEPARTMENT_ERROR
} from '../types';
import { setAlert } from './alertActions';

// Lấy danh sách phòng ban
export const getDepartments = () => async dispatch => {
    try {
        const res = await axios.get('/api/departments');

        dispatch({
            type: GET_DEPARTMENTS,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: DEPARTMENT_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi tải danh sách phòng ban'
        });
    }
};

// Lấy thông tin phòng ban
export const getDepartment = id => async dispatch => {
    try {
        const res = await axios.get(`/api/departments/${id}`);

        dispatch({
            type: GET_DEPARTMENT,
            payload: res.data.data
        });
    } catch (err) {
        dispatch({
            type: DEPARTMENT_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi tải thông tin phòng ban'
        });
    }
};

// Thêm phòng ban mới
export const addDepartment = (departmentData) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const res = await axios.post('/api/departments', departmentData, config);

        dispatch({
            type: ADD_DEPARTMENT,
            payload: res.data.data
        });

        dispatch(setAlert('Tạo phòng ban thành công', 'success'));
        return true;
    } catch (err) {
        dispatch({
            type: DEPARTMENT_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi tạo phòng ban'
        });

        dispatch(setAlert('Lỗi khi tạo phòng ban', 'error'));
        return false;
    }
};

// Cập nhật thông tin phòng ban
export const updateDepartment = (id, departmentData) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const res = await axios.put(`/api/departments/${id}`, departmentData, config);

        dispatch({
            type: UPDATE_DEPARTMENT,
            payload: res.data.data
        });

        dispatch(setAlert('Cập nhật thông tin phòng ban thành công', 'success'));
        return true;
    } catch (err) {
        dispatch({
            type: DEPARTMENT_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi cập nhật thông tin phòng ban'
        });

        dispatch(setAlert('Lỗi khi cập nhật thông tin phòng ban', 'error'));
        return false;
    }
};

// Xóa phòng ban
export const deleteDepartment = id => async dispatch => {
    try {
        await axios.delete(`/api/departments/${id}`);

        dispatch({
            type: DELETE_DEPARTMENT,
            payload: id
        });

        dispatch(setAlert('Xóa phòng ban thành công', 'success'));
        return true;
    } catch (err) {
        dispatch({
            type: DEPARTMENT_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi xóa phòng ban'
        });

        dispatch(setAlert('Lỗi khi xóa phòng ban', 'error'));
        return false;
    }
};

// Lấy danh sách người dùng trong phòng ban
export const getDepartmentUsers = id => async dispatch => {
    try {
        const res = await axios.get(`/api/departments/${id}/users`);

        return res.data.data;
    } catch (err) {
        dispatch({
            type: DEPARTMENT_ERROR,
            payload: err.response?.data?.message || 'Lỗi khi lấy danh sách người dùng trong phòng ban'
        });

        return [];
    }
};
