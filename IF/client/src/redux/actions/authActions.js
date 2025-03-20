import axios from 'axios';
import {
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    UPDATE_PROFILE_SUCCESS,
    UPDATE_PROFILE_FAIL
} from '../types';
import setAuthToken from '../../utils/setAuthToken';

// Load User
export const loadUser = () => async dispatch => {
    if (localStorage.token) {
        setAuthToken(localStorage.token);
    }

    try {
        const res = await axios.get('/api/auth/me');

        dispatch({
            type: USER_LOADED,
            payload: res.data.data
        });
    } catch (err) {
        dispatch({
            type: AUTH_ERROR,
            payload: err.response?.data?.message || 'Lỗi xác thực'
        });
    }
};

// Login User
export const login = (username, password) => async dispatch => {
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const body = JSON.stringify({ username, password });

    try {
        const res = await axios.post('/api/auth/login', body, config);

        dispatch({
            type: LOGIN_SUCCESS,
            payload: { token: res.data.token, user: res.data.user }
        });

        dispatch(loadUser());
    } catch (err) {
        dispatch({
            type: LOGIN_FAIL,
            payload: err.response?.data?.message || 'Đăng nhập thất bại'
        });
    }
};

// Logout
export const logout = () => dispatch => {
    dispatch({ type: LOGOUT });
    // No need for navigation here - this will be handled by component using the action
};

// Update Profile
export const updateProfile = (formData) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };

        const res = await axios.put('/api/users/profile', formData, config);

        dispatch({
            type: UPDATE_PROFILE_SUCCESS,
            payload: res.data.data
        });

        return { success: true, message: res.data.message };
    } catch (err) {
        dispatch({
            type: UPDATE_PROFILE_FAIL,
            payload: err.response?.data?.message || 'Không thể cập nhật thông tin'
        });

        return { success: false, message: err.response?.data?.message || 'Không thể cập nhật thông tin' };
    }
};

// Change Password
export const changePassword = (currentPassword, newPassword) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const body = JSON.stringify({ currentPassword, newPassword });

        const res = await axios.put('/api/users/change-password', body, config);

        return { success: true, message: res.data.message };
    } catch (err) {
        return { success: false, message: err.response?.data?.message || 'Không thể thay đổi mật khẩu' };
    }
};
