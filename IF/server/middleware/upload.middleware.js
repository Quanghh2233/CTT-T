const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = uploadsDir;

        // Kiểm tra loại file để lưu vào thư mục phù hợp
        if (file.fieldname === 'avatar') {
            uploadPath = path.join(uploadsDir, 'avatars');
        } else if (file.fieldname === 'thumbnail') {
            uploadPath = path.join(uploadsDir, 'thumbnails');
        } else if (file.fieldname === 'document') {
            uploadPath = path.join(uploadsDir, 'documents');
        }

        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Tạo tên file bằng timestamp + tên file gốc
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${fileExt}`);
    }
});

// Lọc file
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        'avatar': ['image/jpeg', 'image/png', 'image/gif'],
        'thumbnail': ['image/jpeg', 'image/png', 'image/gif'],
        'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    };

    if (allowedTypes[file.fieldname] && allowedTypes[file.fieldname].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Loại file không được hỗ trợ. Chỉ chấp nhận ${allowedTypes[file.fieldname] ? allowedTypes[file.fieldname].join(', ') : 'không có loại file nào'}`), false);
    }
};

// Cấu hình upload
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // giới hạn 10MB
    }
});

module.exports = upload;
