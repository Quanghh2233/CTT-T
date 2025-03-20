import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { loadUser } from './redux/actions/authActions';
import setAuthToken from './utils/setAuthToken';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import HomePage from './pages/public/HomePage';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import NewsList from './pages/news/NewsList';
import NewsDetail from './pages/news/NewsDetail';
import NewsForm from './pages/news/NewsForm';
import DocumentList from './pages/documents/DocumentList';
import DocumentDetail from './pages/documents/DocumentDetail';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import Profile from './pages/user/Profile';

// Components
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Check for token in localStorage
if (localStorage.token) {
    setAuthToken(localStorage.token);
}

const App = () => {
    useEffect(() => {
        store.dispatch(loadUser());
    }, []);

    return (
        <Provider store={store}>
            <ErrorBoundary>
                <Router>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<Login />} />

                        {/* Protected routes with /portal prefix */}
                        <Route path="/portal" element={
                            <PrivateRoute>
                                <AppLayout />
                            </PrivateRoute>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="news" element={<NewsList />} />
                            <Route path="news/:id" element={<NewsDetail />} />
                            <Route path="news/create" element={<NewsForm />} />
                            <Route path="news/edit/:id" element={<NewsForm />} />
                            <Route path="documents" element={<DocumentList />} />
                            <Route path="documents/:id" element={<DocumentDetail />} />
                            <Route path="profile" element={<Profile />} />

                            {/* Admin Routes */}
                            <Route path="admin/users" element={
                                <AdminRoute>
                                    <UserManagement />
                                </AdminRoute>
                            } />
                            <Route path="admin/departments" element={
                                <AdminRoute>
                                    <DepartmentManagement />
                                </AdminRoute>
                            } />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Router>
            </ErrorBoundary>
        </Provider>
    );
};

export default App;
