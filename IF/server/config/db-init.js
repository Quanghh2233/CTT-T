const bcrypt = require('bcryptjs');
const { sequelize, User, Department, News, Document } = require('../models');
const path = require('path');
const fs = require('fs');

const initDatabase = async () => {
    try {
        // Reset database
        await sequelize.sync({ force: true });
        console.log('Database synced!');

        // Create departments
        const departments = await Department.bulkCreate([
            {
                name: 'Ban Giám đốc',
                code: 'BGD',
                description: 'Ban lãnh đạo của Bộ Tài Chính',
                headOfDepartment: 'Nguyễn Văn A',
                email: 'bangiamdoc@mof.gov.vn',
                phoneNumber: '024 12345678'
            },
            {
                name: 'Phòng Kế toán',
                code: 'PKT',
                description: 'Phòng Kế toán của Bộ Tài Chính',
                headOfDepartment: 'Trần Thị B',
                email: 'phongketoan@mof.gov.vn',
                phoneNumber: '024 12345679'
            },
            {
                name: 'Phòng Chính sách tài chính',
                code: 'PCTC',
                description: 'Phòng Chính sách tài chính của Bộ Tài Chính',
                headOfDepartment: 'Lê Văn C',
                email: 'chinhsachtaichinh@mof.gov.vn',
                phoneNumber: '024 12345680'
            },
            {
                name: 'Phòng Công nghệ thông tin',
                code: 'CNTT',
                description: 'Phòng Công nghệ thông tin của Bộ Tài Chính',
                headOfDepartment: 'Phạm Văn D',
                email: 'cntt@mof.gov.vn',
                phoneNumber: '024 12345681'
            }
        ]);

        console.log('Created departments');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // Create users
        const users = await User.bulkCreate([
            {
                username: 'admin',
                password: hashedPassword,
                fullName: 'Quản trị viên',
                email: 'admin@mof.gov.vn',
                position: 'Quản trị hệ thống',
                phoneNumber: '0987654321',
                role: 'admin',
                DepartmentId: 4 // CNTT
            },
            {
                username: 'manager1',
                password: hashedPassword,
                fullName: 'Trưởng phòng Kế toán',
                email: 'manager1@mof.gov.vn',
                position: 'Trưởng phòng',
                phoneNumber: '0987654322',
                role: 'manager',
                DepartmentId: 2 // Kế toán
            },
            {
                username: 'staff1',
                password: hashedPassword,
                fullName: 'Nhân viên Chính sách',
                email: 'staff1@mof.gov.vn',
                position: 'Chuyên viên',
                phoneNumber: '0987654323',
                role: 'staff',
                DepartmentId: 3 // Chính sách
            },
            {
                username: 'staff2',
                password: hashedPassword,
                fullName: 'Nhân viên IT',
                email: 'staff2@mof.gov.vn',
                position: 'Kỹ sư CNTT',
                phoneNumber: '0987654324',
                role: 'staff',
                DepartmentId: 4 // CNTT
            }
        ]);

        console.log('Created users');

        // Create news
        const news = await News.bulkCreate([
            {
                title: 'Thông báo lịch họp Ban Giám đốc tháng 5/2023',
                content: '<p>Kính gửi các đơn vị,</p><p>Ban Giám đốc sẽ tổ chức cuộc họp định kỳ vào ngày 15/05/2023 tại Phòng họp A, tầng 5, trụ sở Bộ Tài chính.</p><p>Thời gian: 8h30 - 11h30</p><p>Nội dung: Báo cáo kết quả hoạt động quý I và kế hoạch quý II/2023</p><p>Thành phần tham dự: Ban Giám đốc, Trưởng các Phòng ban trực thuộc.</p><p>Đề nghị các đơn vị chuẩn bị báo cáo và tài liệu liên quan.</p>',
                summary: 'Ban Giám đốc sẽ tổ chức cuộc họp định kỳ vào ngày 15/05/2023 tại Phòng họp A, tầng 5, trụ sở Bộ Tài chính.',
                category: 'announcement',
                isPublished: true,
                UserId: 1 // Admin
            },
            {
                title: 'Quy chế chi tiêu nội bộ năm 2023',
                content: '<h2>Quy chế chi tiêu nội bộ năm 2023</h2><p>Căn cứ theo Nghị định số xx/2023/NĐ-CP và các quy định hiện hành, Bộ Tài chính ban hành Quy chế chi tiêu nội bộ năm 2023 với các nội dung chính như sau:</p><h3>1. Chi tiêu hành chính</h3><p>- Văn phòng phẩm: Theo định mức quy định tại Phụ lục 1</p><p>- Chi phí điện, nước, điện thoại: Theo định mức quy định tại Phụ lục 2</p><h3>2. Chi tiêu đi công tác</h3><p>- Công tác phí trong nước: Theo định mức quy định tại Phụ lục 3</p><p>- Công tác phí nước ngoài: Theo định mức quy định tại Phụ lục 4</p><h3>3. Chi tiêu hội nghị, hội thảo</h3><p>- Chi phí tổ chức hội nghị: Theo định mức quy định tại Phụ lục 5</p><p>- Chi phí tổ chức hội thảo: Theo định mức quy định tại Phụ lục 6</p><p>Quy chế này có hiệu lực từ ngày 01/06/2023.</p>',
                summary: 'Bộ Tài chính ban hành Quy chế chi tiêu nội bộ năm 2023 với các nội dung về chi tiêu hành chính, công tác phí, hội nghị, hội thảo.',
                category: 'policy',
                isPublished: true,
                UserId: 2 // Manager
            },
            {
                title: 'Kế hoạch đào tạo nâng cao năng lực CNTT năm 2023',
                content: '<h2>Kế hoạch đào tạo nâng cao năng lực CNTT năm 2023</h2><p>Phòng CNTT xin thông báo kế hoạch đào tạo nâng cao năng lực CNTT năm 2023 dành cho cán bộ, công chức, viên chức thuộc Bộ Tài chính.</p><h3>Các khóa đào tạo:</h3><ol><li>An toàn thông tin cơ bản: Từ 10/07 - 14/07/2023</li><li>Kỹ năng sử dụng Office 365: Từ 24/07 - 28/07/2023</li><li>Kỹ năng phân tích dữ liệu với Power BI: Từ 07/08 - 11/08/2023</li><li>Bảo mật nâng cao: Từ 21/08 - 25/08/2023</li></ol><p>Đối tượng tham gia: Toàn thể cán bộ, công chức, viên chức thuộc Bộ Tài chính.</p><p>Thời gian đăng ký: Từ ngày 15/06/2023 đến 30/06/2023.</p><p>Hình thức đăng ký: Điền phiếu đăng ký tại link sau: <a href="#">Link đăng ký</a></p>',
                summary: 'Phòng CNTT thông báo kế hoạch đào tạo nâng cao năng lực CNTT năm 2023 với các khóa học về an toàn thông tin, Office 365, Power BI, bảo mật nâng cao.',
                category: 'training',
                isPublished: true,
                UserId: 4 // IT Staff
            },
            {
                title: 'Thông báo nghỉ lễ Quốc khánh 2/9/2023',
                content: '<h2>Thông báo nghỉ lễ Quốc khánh 2/9/2023</h2><p>Kính gửi toàn thể cán bộ, công chức, viên chức và người lao động,</p><p>Căn cứ Bộ luật Lao động 2019 và thông báo của Chính phủ về việc nghỉ lễ Quốc khánh 2/9/2023, Bộ Tài chính thông báo lịch nghỉ lễ như sau:</p><p><strong>Thời gian nghỉ:</strong> Từ ngày 02/09/2023 đến hết ngày 04/09/2023 (03 ngày).</p><p>Các đơn vị bố trí lịch trực, đảm bảo an ninh, an toàn cơ quan trong thời gian nghỉ lễ.</p><p>Đề nghị Thủ trưởng các đơn vị thông báo đến toàn thể cán bộ, công chức, viên chức và người lao động thuộc đơn vị được biết và thực hiện.</p>',
                summary: 'Thông báo về lịch nghỉ lễ Quốc khánh từ ngày 02/09/2023 đến hết ngày 04/09/2023 (03 ngày).',
                category: 'announcement',
                isPublished: true,
                UserId: 1 // Admin
            },
            {
                title: 'Kết quả hoạt động tài chính quý II/2023',
                content: '<h2>Kết quả hoạt động tài chính quý II/2023</h2><p>Bộ Tài chính công bố kết quả hoạt động tài chính quý II/2023 với các chỉ tiêu chính như sau:</p><h3>1. Thu ngân sách</h3><p>- Tổng thu ngân sách: 350.000 tỷ đồng, đạt 52% dự toán năm</p><p>- Thu nội địa: 280.000 tỷ đồng, đạt 48% dự toán năm</p><p>- Thu từ dầu thô: 25.000 tỷ đồng, đạt 60% dự toán năm</p><p>- Thu từ hoạt động xuất nhập khẩu: 45.000 tỷ đồng, đạt 55% dự toán năm</p><h3>2. Chi ngân sách</h3><p>- Tổng chi ngân sách: 320.000 tỷ đồng, bằng 45% dự toán năm</p><p>- Chi đầu tư phát triển: 95.000 tỷ đồng, đạt 40% dự toán năm</p><p>- Chi thường xuyên: 220.000 tỷ đồng, đạt 48% dự toán năm</p><p>- Chi trả nợ và viện trợ: 5.000 tỷ đồng, đạt 50% dự toán năm</p><p>Kết quả trên cho thấy tình hình tài chính quốc gia đang phát triển theo đúng lộ trình và dự báo.</p>',
                summary: 'Bộ Tài chính công bố kết quả hoạt động tài chính quý II/2023 với tổng thu ngân sách đạt 350.000 tỷ đồng, chi ngân sách 320.000 tỷ đồng.',
                category: 'report',
                isPublished: true,
                UserId: 3 // Staff
            }
        ]);

        console.log('Created news');

        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../../uploads/documents');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Create a sample document file
        const sampleDocPath = path.join(uploadsDir, 'sample-doc.pdf');
        fs.writeFileSync(sampleDocPath, 'Sample document content');

        // Create documents
        const documents = await Document.bulkCreate([
            {
                title: 'Quy định về quản lý tài sản công',
                description: 'Quy định chi tiết về việc quản lý, sử dụng, xử lý tài sản công tại các cơ quan nhà nước',
                fileName: 'quy-dinh-quan-ly-tai-san-cong.pdf',
                filePath: 'sample-doc.pdf', // Using the sample doc we created
                fileSize: 1024 * 1024, // 1MB
                fileType: 'application/pdf',
                category: 'regulation',
                isPublic: true,
                UserId: 1, // Admin
                DepartmentId: 1 // Ban Giám đốc
            },
            {
                title: 'Mẫu báo cáo tài chính quý',
                description: 'Biểu mẫu chuẩn để các đơn vị báo cáo tài chính hàng quý',
                fileName: 'bao-cao-tai-chinh-quy.xlsx',
                filePath: 'sample-doc.pdf', // Using the sample doc we created
                fileSize: 512 * 1024, // 512KB
                fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                category: 'form',
                isPublic: true,
                UserId: 2, // Manager
                DepartmentId: 2 // Kế toán
            },
            {
                title: 'Kế hoạch ngân sách năm 2023',
                description: 'Kế hoạch phân bổ ngân sách cho các đơn vị trực thuộc Bộ Tài Chính năm 2023',
                fileName: 'ke-hoach-ngan-sach-2023.pdf',
                filePath: 'sample-doc.pdf', // Using the sample doc we created
                fileSize: 2 * 1024 * 1024, // 2MB
                fileType: 'application/pdf',
                category: 'plan',
                isPublic: false,
                UserId: 3, // Staff
                DepartmentId: 3 // Chính sách
            },
            {
                title: 'Hướng dẫn sử dụng hệ thống thông tin nội bộ',
                description: 'Tài liệu hướng dẫn chi tiết cách sử dụng các chức năng của hệ thống thông tin nội bộ',
                fileName: 'huong-dan-su-dung.docx',
                filePath: 'sample-doc.pdf', // Using the sample doc we created
                fileSize: 1.5 * 1024 * 1024, // 1.5MB
                fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                category: 'other',
                isPublic: true,
                UserId: 4, // IT Staff
                DepartmentId: 4 // CNTT
            }
        ]);

        console.log('Created documents');
        console.log('Database initialization completed successfully');

        return {
            departments,
            users,
            news,
            documents
        };
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
};

// If this script is run directly (node db-init.js)
if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log('Database initialized successfully.');
            process.exit(0);
        })
        .catch(err => {
            console.error('Failed to initialize database:', err);
            process.exit(1);
        });
}

module.exports = initDatabase;
