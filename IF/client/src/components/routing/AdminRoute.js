import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin, Result } from 'antd';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useSelector(state => state.auth);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" tip="Đang tải..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (user && user.role !== 'admin') {
        return (
            <Result
                status="403"
                title="403"
                subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
            />
        );
    }

    return children;
};

export default AdminRoute;
