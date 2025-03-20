# Cổng thông tin điện tử nội bộ Bộ Tài Chính

Hệ thống cổng thông tin điện tử nội bộ dành cho Bộ Tài Chính, được xây dựng bằng Node.js, React và SQLite.

## Tính năng

- Quản lý tin tức nội bộ
- Quản lý tài liệu và văn bản
  - Xem trước tài liệu trực tiếp trên trình duyệt
  - Tải xuống tài liệu với một cú nhấp chuột
  - Phân quyền truy cập tài liệu theo phòng ban
- Quản lý người dùng và phòng ban
- Phân quyền người dùng (Quản trị viên, Quản lý, Nhân viên)
- Thống kê hoạt động
- Giao diện người dùng thân thiện và hiện đại

## Yêu cầu hệ thống

- Node.js (v14+)
- npm (v6+)

## Cài đặt và khởi chạy

### 1. Clone dự án

```bash
git clone <repository-url>
cd finance-ministry-portal
```

### 2. Cài đặt các gói phụ thuộc

```bash
# Cài đặt các gói phụ thuộc cho server
npm install

# Cài đặt các gói phụ thuộc cho client
npm run install-all
```

### 3. Khởi tạo cơ sở dữ liệu

```bash
npm run init-db
```

Lệnh này sẽ tạo cơ sở dữ liệu SQLite và khởi tạo dữ liệu mẫu bao gồm:
- Các phòng ban mẫu
- Tài khoản người dùng (xem chi tiết bên dưới)
- Tin tức và tài liệu mẫu

### 4. Khởi chạy ứng dụng

```bash
# Chạy cả server và client
npm run dev

# Hoặc chạy riêng server
npm run server

# Hoặc chạy riêng client
npm run client
```

Ứng dụng sẽ chạy tại:
- Server: http://localhost:6000
- Client: http://localhost:4000

## Hướng dẫn chạy trên Windows
Nếu bạn đang sử dụng Windows, vui lòng đảm bảo:
- Đã cài đặt Node.js (tải từ https://nodejs.org/en/download/)
  - **Quan trọng**: Đảm bảo cài đặt đúng phiên bản Node.js phù hợp với hệ điều hành của bạn (32-bit hoặc 64-bit)
- Mở ứng dụng “Command Prompt” hoặc “PowerShell” với quyền quản trị (nếu cần)
- Chạy các lệnh cài đặt tương tự như trên (npm install, npm run install-all, v.v.)
- Sử dụng lệnh: 
```powershell
npm run init-db
npm run dev
```
để khởi tạo cơ sở dữ liệu và chạy ứng dụng
- Kiểm tra rằng cổng (port) 6000 (server) và 4000 (client) đều mở và không bị tường lửa chặn

## Xử lý lỗi SQLite trên Windows

Nếu bạn gặp lỗi `node_sqlite3.node is not a valid Win32 application`, đây là vấn đề tương thích giữa phiên bản SQLite3 và hệ điều hành của bạn. Thực hiện các bước sau để khắc phục:

### Giải pháp cho Windows 32-bit
```bash
# Gỡ cài đặt sqlite3 hiện tại
npm uninstall sqlite3

# Cài đặt lại với cấu hình cho 32-bit
npm install sqlite3 --build-from-source --target_arch=ia32
```

### Giải pháp cho Windows 64-bit
```bash
# Gỡ cài đặt sqlite3 hiện tại
npm uninstall sqlite3

# Cài đặt lại với cấu hình cho 64-bit
npm install sqlite3 --build-from-source --target_arch=x64
```

### Giải pháp thay thế
Nếu các giải pháp trên không hiệu quả, hãy thử:
```bash
# Gỡ cài đặt sqlite3 hiện tại
npm uninstall sqlite3

# Cài đặt các công cụ build nếu chưa có
npm install -g node-gyp
npm install -g windows-build-tools

# Cài đặt lại sqlite3
npm install sqlite3
```

**Lưu ý**: Đảm bảo rằng phiên bản Node.js và SQLite3 tương thích với nhau. Nếu vẫn gặp vấn đề, hãy thử cài đặt phiên bản cụ thể của SQLite3:
```bash
npm install sqlite3@5.0.0
```

## Tài khoản mẫu

Sau khi khởi tạo cơ sở dữ liệu, bạn có thể đăng nhập với các tài khoản sau:

1. **Quản trị viên**
   - Username: admin
   - Password: 123456

2. **Quản lý**
   - Username: manager1
   - Password: 123456

3. **Nhân viên**
   - Username: staff1
   - Password: 123456
   - Username: staff2
   - Password: 123456

## Cấu trúc dự án

```
/
├── client/                 # Frontend (React)
│   ├── public/             # Static files
│   └── src/                # Source code
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── redux/          # Redux state management
│       └── utils/          # Utility functions
├── server/                 # Backend (Node.js)
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Sequelize models
│   └── routes/             # Express routes
├── uploads/                # Uploaded files
└── database.sqlite         # SQLite database file
```

## Phân quyền người dùng

1. **Quản trị viên (admin)**
   - Quản lý tất cả các chức năng
   - Quản lý người dùng và phòng ban
   - Quản lý tin tức và tài liệu

2. **Quản lý (manager)**
   - Quản lý tin tức
   - Quản lý tài liệu
   - Xem thống kê

3. **Nhân viên (staff)**
   - Xem tin tức
   - Xem và tải tài liệu được phép
   - Quản lý thông tin cá nhân

## License

Cổng thông tin điện tử nội bộ Bộ Tài Chính © 2023
