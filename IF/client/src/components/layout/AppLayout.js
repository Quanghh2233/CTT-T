import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    HomeOutlined,
    NotificationOutlined,
    FileOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    BellOutlined
} from '@ant-design/icons';
import { logout } from '../../redux/actions/authActions';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

const AppLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector(state => state.auth);

    const onLogout = () => {
        dispatch(logout());
        navigate('/'); // Changed from '/login' to '/' to redirect to home page
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                <Link to="/portal/profile">Thông tin cá nhân</Link>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    const notificationsMenu = (
        <Menu>
            <Menu.Item key="no-notifications" disabled>
                Không có thông báo mới
            </Menu.Item>
        </Menu>
    );

    // Xác định khóa menu được chọn dựa trên đường dẫn hiện tại
    const getSelectedKey = () => {
        const path = location.pathname;
        if (path === '/portal') return '1';
        if (path.startsWith('/portal/news')) return '2';
        if (path.startsWith('/portal/documents')) return '3';
        if (path.startsWith('/portal/admin/users')) return 'admin-1';
        if (path.startsWith('/portal/admin/departments')) return 'admin-2';
        return '1';
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={value => setCollapsed(value)}
                theme="dark"
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    background: 'linear-gradient(180deg, #001529, #003366)',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
                    zIndex: 100
                }}
            >
                <div className="logo" style={{
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.05)'
                }}>
                    {!collapsed && (
                        <Title level={4} style={{
                            color: 'white',
                            margin: 0,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                        }}>BỘ TÀI CHÍNH</Title>
                    )}
                </div>
                <Menu
                    theme="dark"
                    selectedKeys={[getSelectedKey()]}
                    mode="inline"
                >
                    <Menu.Item key="1" icon={<HomeOutlined />}>
                        <Link to="/portal">Trang chủ</Link>
                    </Menu.Item>
                    <Menu.Item key="2" icon={<NotificationOutlined />}>
                        <Link to="/portal/news">Tin tức & Thông báo</Link>
                    </Menu.Item>
                    <Menu.Item key="3" icon={<FileOutlined />}>
                        <Link to="/portal/documents">Tài liệu</Link>
                    </Menu.Item>

                    {user && user.role === 'admin' && (
                        <Menu.SubMenu key="admin" icon={<SettingOutlined />} title="Quản trị">
                            <Menu.Item key="admin-1">
                                <Link to="/portal/admin/users">Người dùng</Link>
                            </Menu.Item>
                            <Menu.Item key="admin-2">
                                <Link to="/portal/admin/departments">Phòng ban</Link>
                            </Menu.Item>
                        </Menu.SubMenu>
                    )}
                </Menu>
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
                <Header style={{
                    padding: '0 24px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 1px 4px rgba(0,21,41,.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 1,
                    position: 'sticky',
                    top: 0
                }}>
                    <div className="toggle-sidebar">
                        {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            onClick: () => setCollapsed(!collapsed),
                            style: { fontSize: '18px', cursor: 'pointer' }
                        })}
                    </div>
                    <div className="header-right" style={{ display: 'flex', alignItems: 'center' }}>
                        <Dropdown overlay={notificationsMenu} trigger={['click']}>
                            <Badge count={0} style={{ marginRight: 24 }}>
                                <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
                            </Badge>
                        </Dropdown>
                        <Dropdown overlay={userMenu} trigger={['click']}>
                            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Avatar icon={<UserOutlined />} src={user && user.avatar} />
                                <span style={{ marginLeft: 8 }}>{user ? user.fullName : 'Người dùng'}</span>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content style={{
                    margin: '24px 16px',
                    padding: 24,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    minHeight: 280,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}>
                    <Outlet />
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Cổng thông tin điện tử nội bộ Bộ Tài Chính ©{new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
