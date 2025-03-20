import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // We'll create this file next
import App from './App';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';
import 'moment/locale/vi';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component
root.render(
    <React.StrictMode>
        <ConfigProvider locale={viVN}>
            <App />
        </ConfigProvider>
    </React.StrictMode>
);
