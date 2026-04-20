const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const userModel = require('../models/userModel');

class PassportManager {
    constructor() {
        this._clientID = process.env.GOOGLE_CLIENT_ID;
        this._clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        this._callbackURL = process.env.GOOGLE_CALLBACK_URL;
    }

    init() {
        // --- 1. CHIẾN LƯỢC ĐĂNG NHẬP BẰNG SỐ ĐIỆN THOẠI (MỚI) ---
        passport.use(new LocalStrategy({
        usernameField: 'phone',
        passwordField: 'password'
        }, async (phone, password, done) => {
            try {
                console.log("--- Đang kiểm tra đăng nhập ---");
                console.log("Phone nhận vào:", phone);
                console.log("Pass nhận vào:", password);

                const user = await userModel.findByPhoneAndPassword(phone, password);
                
                console.log("Kết quả tìm User:", user ? "Tìm thấy" : "Không thấy");

                if (!user) {
                    return done(null, false, { message: 'Sai số điện thoại hoặc mật khẩu.' });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }));

        // --- 2. CHIẾN LƯỢC GOOGLE  ---
        passport.use(new GoogleStrategy({
            clientID: this._clientID,
            clientSecret: this._clientSecret,
            callbackURL: this._callbackURL
        }, this._verifyCallback.bind(this)));

        // Ghi ID người dùng vào session (GIỮ NGUYÊN)
        passport.serializeUser((user, done) => {
            done(null, user.user_id);
        });

        // Lấy thông tin người dùng từ ID (GIỮ NGUYÊN)
        passport.deserializeUser(async (id, done) => {
            try {
                const user = await userModel.findById(id);
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        });
    }

    // Logic xử lý Google
    async _verifyCallback(accessToken, refreshToken, profile, done) {
        try {
            const googleId = String(profile.id);
            const user = await userModel.findByGoogleId(googleId);

            if (user) {
                console.log("✅ Thấy user cũ rồi, đăng nhập thôi:", user.username);
                return done(null, user); 
            }

            console.log("🆕 Đang tạo user mới từ Google...");
            const insertId = await userModel.createFromGoogle({
                google_id: googleId,
                username: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value
            });

            const newUser = await userModel.findById(insertId);
            return done(null, newUser);

        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                const user = await userModel.findByGoogleId(profile.id);
                if (user) return done(null, user);
            }
            console.error("❌ Lỗi Passport Verify:", error);
            return done(error, null);
        }
    }
}

module.exports = new PassportManager();