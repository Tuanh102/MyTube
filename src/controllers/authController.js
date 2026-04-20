const passport = require('passport');
const userModel = require('../models/userModel');

class AuthController {
    // 1. Logic Đăng nhập bằng Số điện thoại (Local)
    async loginLocal(req, res, next) {
        // Sử dụng passport.authenticate cho chiến lược 'local' đã cấu hình
        passport.authenticate('local', (err, user, info) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
            
            if (!user) {
                // info.message lấy từ LocalStrategy (Sai số điện thoại hoặc mật khẩu)
                return res.json({ success: false, message: info.message || 'Đăng nhập thất bại' });
            }

            // Nếu khớp, tiến hành đăng nhập và tạo Session
            req.logIn(user, (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Không thể tạo phiên đăng nhập' });
                return res.json({ success: true, message: 'Đăng nhập thành công' });
            });
        })(req, res, next);
    }

    // 2. Logic Đăng ký tài khoản mới
    async registerLocal(req, res) {
        try {
            const { username, phone, password } = req.body;
            
            // Kiểm tra xem có nhận đủ dữ liệu không
            if (!username || !phone || !password) {
                return res.json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
            }

            const existingUser = await userModel.findByPhone(phone);
            if (existingUser) {
                return res.json({ success: false, message: 'Số điện thoại này đã tồn tại' });
            }

            await userModel.createLocal(username, phone, password);
            res.json({ success: true });
        } catch (error) {
            // Thay vì hiện "Lỗi server", mình hiện thẳng lỗi SQL ra để Tuanh sửa
            console.error(error);
            res.status(500).json({ success: false, message: 'Lỗi: ' + error.message });
        }
    }

    // 3. Google Callback (Giữ nguyên của Tuanh)
    googleCallback(req, res) {
        res.redirect('/');
    }

    // 4. Đăng xuất (Giữ nguyên của Tuanh)
    logout(req, res, next) {
        req.logout((err) => {
            if (err) return next(err);
            res.redirect('/');
        });
    }
}

module.exports = new AuthController();