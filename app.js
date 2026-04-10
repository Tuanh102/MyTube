const express = require('express');
const path = require('path');
require('dotenv').config();

// Khởi tạo ứng dụng Express
const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. CẤU HÌNH VIEW ENGINE (EJS) ---
// Chỉ định dùng EJS để vẽ giao diện
app.set('view engine', 'ejs');
// Trỏ đường dẫn vào thư mục src/views mà Tuanh đã tạo
app.set('views', path.join(__dirname, 'src', 'views'));

// --- 2. CẤU HÌNH FILE TĨNH (STATIC FILES) ---
// Trỏ vào thư mục public để trình duyệt có thể tải CSS, JS, Images
app.use(express.static(path.join(__dirname, 'public')));

// --- 3. CẤU HÌNH MIDDLEWARE ---
// Cho phép Express đọc dữ liệu từ Form (khi Tuanh nhấn nút Đăng ký)
app.use(express.urlencoded({ extended: true }));
// Cho phép Express đọc dữ liệu định dạng JSON
app.use(express.json());

// --- 4. KẾT NỐI DATABASE (KIỂM TRA) ---
const db = require('./src/config/database');
// (Dòng này sẽ kích hoạt việc kiểm tra kết nối ngay khi chạy app)

// --- 5. ĐỊNH TUYẾN (ROUTES) ---
// Sau này Tuanh sẽ tách routes ra file riêng, tạm thời ta khai báo ở đây để test
app.get('/', async (req, res) => {
    try {
        // Tạm thời nếu Tuanh chưa lấy từ Database, hãy để mảng rỗng []
        // Nếu đã có database.js, hãy dùng: const [videos] = await db.execute('SELECT * FROM videos');
        const videos = []; 

        res.render('page/home', { 
            title: 'Trang chủ MyTube',
            videos: videos // CỰC KỲ QUAN TRỌNG: Phải gửi biến videos này qua EJS
        });
    } catch (error) {
        console.error(error);
        res.render('page/home', { 
            title: 'Trang chủ MyTube',
            videos: [] // Luôn gửi mảng rỗng nếu có lỗi để tránh sập web
        });
    }
});

// Ví dụ về route Đăng ký
app.get('/register', (req, res) => {
    res.render('page/register', { title: 'Đăng ký tài khoản' });
});

// --- 6. XỬ LÝ LỖI 404 (KHI VÀO ĐƯỜNG DẪN KHÔNG TỒN TẠI) ---
app.use((req, res) => {
    res.status(404).send('<h1>Lỗi 404: Trang này không tồn tại rồi Tuanh ơi!</h1>');
});

// --- 7. KHỞI ĐỘNG SERVER ---
app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`🚀 MyTube Server đang chạy!`);
    console.log(`🔗 Link: http://localhost:${PORT}`);
    console.log('-------------------------------------------');
});