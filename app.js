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

// --- 3. CẤU HÌNH BODY PARSER (XỬ LÝ DỮ LIỆU FORM) ---
app.use(express.urlencoded({ extended: true })); // Xử lý dữ liệu từ form (POST)
app.use(express.json()); // Xử lý dữ liệu JSON (nếu cần)

// --- 4. KẾT NỐI DATABASE (KIỂM TRA) ---
const db = require('./src/configs/database');
// (Dòng này sẽ kích hoạt việc kiểm tra kết nối ngay khi chạy app)

// --- 5. ĐĂNG KÝ ROUTES ---
const webRoutes = require('./src/routes/web');
app.use('/', webRoutes); // Sử dụng các route đã định nghĩa trong web.js

// --- 6. XỬ LÝ LỖI 404 (KHI VÀO ĐƯỜNG DẪN KHÔNG TỒN TẠI) ---
app.use((req, res) => {
    res.status(404).send('<h1>Lỗi 404: Trang này không tồn tại !</h1>');
});

// --- 7. KHỞI ĐỘNG SERVER ---
app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`🚀 MyTube Server đang chạy!`);
    console.log(`🔗 Link: http://localhost:${PORT}`);
    console.log('-------------------------------------------');
});