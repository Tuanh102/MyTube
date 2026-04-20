const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Import cấu hình và Routes
const db = require('./src/configs/database');
const passportManager = require('./src/configs/passport');
const authRoutes = require('./src/routes/authRoutes');
const webRoutes = require('./src/routes/web');
const authMiddleware = require('./src/middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. CẤU HÌNH MIDDLEWARE CƠ BẢN
// ==========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(authMiddleware.localsUser);
// ==========================================
// 2. CẤU HÌNH XÁC THỰC (SESSION & PASSPORT)
// ==========================================
// Lưu ý: Session phải đứng trước Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'mytube_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Đặt true nếu chạy HTTPS
}));

// Khởi tạo Passport từ Class PassportManager (OOP)
passportManager.init();
app.use(passport.initialize());
app.use(passport.session());
app.use(authMiddleware.localsUser);

// ==========================================
// 3. MIDDLEWARE TOÀN CỤC (GLOBAL)
// ==========================================
app.use((req, res, next) => {
    // Đẩy thông tin user ra biến locals để mọi file EJS đều dùng được
    res.locals.user = req.user || null;
    next();
});

// ==========================================
// 4. ĐỊNH NGHĨA ROUTES
// ==========================================
app.use('/', authRoutes); // Các đường dẫn đăng nhập/đăng xuất
app.use('/', webRoutes);  // Các đường dẫn trang chủ, xem video

// ==========================================
// 5. XỬ LÝ LỖI & KHỞI ĐỘNG
// ==========================================
// Xử lý lỗi 404
// tất cả route ở trên

app.use((req, res) => {
    res.status(404).render('page/404', {
        message: 'Trang không tồn tại'
    });
});

app.listen(PORT, () => {
    console.log('=====================================================');
    console.log(`🚀 MyTube Server đang chạy tại: http://localhost:${PORT}`);
    console.log('=====================================================');
});