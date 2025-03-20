import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <Result
                    status="error"
                    title="Có lỗi xảy ra"
                    subTitle="Xin lỗi, hệ thống gặp sự cố. Vui lòng thử lại hoặc liên hệ quản trị viên."
                    extra={[
                        <Button type="primary" key="console" onClick={() => window.location.reload()}>
                            Tải lại trang
                        </Button>,
                        <Button key="home" onClick={() => window.location.href = '/'}>
                            Về trang chủ
                        </Button>,
                    ]}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
