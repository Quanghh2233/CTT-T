const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const fs = require('fs');
const ensureDirectories = require('./utils/ensureDirectories');

// Ensure all required directories exist
ensureDirectories();

// Khởi tạo app Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Handle favicon.ico requests
app.use('/favicon.ico', (req, res) => {
    // Check if favicon exists in the public folder first
    const faviconPath = path.join(__dirname, 'public', 'favicon.ico');

    if (fs.existsSync(faviconPath)) {
        res.sendFile(faviconPath);
    } else {
        // If not found, return a 204 No Content status
        res.status(204).end();
    }
});

// Thư mục static cho tệp upload
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/news', require('./routes/news.routes'));
app.use('/api/documents', require('./routes/document.routes'));
app.use('/api/stats', require('./routes/stats.routes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Any routes not caught by API routes will be handled by the React app
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
    });
} else {
    // In development, redirect root to the API documentation or a welcome page
    app.get('/', (req, res) => {
        res.json({
            message: 'Chào mừng đến với API của Cổng thông tin điện tử nội bộ Bộ Tài Chính',
            endpoints: {
                auth: '/api/auth',
                users: '/api/users',
                departments: '/api/departments',
                news: '/api/news',
                documents: '/api/documents',
                stats: '/api/stats'
            }
        });
    });
}

// Xử lý lỗi
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Đã xảy ra lỗi!', error: err.message });
});

const PORT = process.env.PORT || 6000;

// Changed from alter: true to force: false to prevent migrations that might cause errors
// Sync database và khởi động server
sequelize.sync({ force: false })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`=================================================`);
            console.log(`Server đang chạy tại port ${PORT}`);
            console.log(`http://localhost:${PORT}/`);
            console.log(`=================================================`);
        });
    })
    .catch(err => {
        console.error('Không thể kết nối đến database:', err);
        process.exit(1);
    });
