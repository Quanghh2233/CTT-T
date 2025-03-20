import { combineReducers } from 'redux';
import auth from './authReducer';
import alert from './alertReducer';
import news from './newsReducer';
import document from './documentReducer';
import department from './departmentReducer';
import user from './userReducer';

export default combineReducers({
    auth,
    alert,
    news,
    document,
    department,
    user
});
