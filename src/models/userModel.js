const db = require('../configs/database');

class UserModel {

    //==================================
    // CÁC HÀM CHO ĐĂNG NHẬP BẰNG GOOGLE
    //==================================

    // 1. Tìm bằng Google ID
    async findByGoogleId(googleId) {
        const rows = await db.query('SELECT * FROM users WHERE google_id = ?', [String(googleId)]);
        if (rows && rows.length > 0) {
            return rows[0]; 
        }
        return null;
    }

    // 2. Tìm bằng ID để duy trì session
    async findById(id) {
        const rows = await db.query('SELECT * FROM users WHERE user_id = ?', [id]);
        return rows[0];
    }

    // 3. Tạo user từ Google
    async createFromGoogle(data) {
        const { google_id, username, email, avatar } = data;
        const safeUsername = `${username}_${google_id.slice(-4)}`;

        await db.query(
            `INSERT INTO users (google_id, username, email, avatar, role)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                username = VALUES(username),
                email = VALUES(email),
                avatar = VALUES(avatar)`,
            [google_id, safeUsername, email, avatar, 'viewer']
        );
        const user = await this.findByGoogleId(google_id);
        return user.user_id;
    }

    // ===================================
    // CÁC HÀM MỚI CHO ĐĂNG NHẬP & ĐĂNG KÝ
    // ===================================

    // 4. Tìm user bằng Số điện thoại (Dùng để check trùng lúc ĐĂNG KÝ)
    async findByPhone(phone) {
        const rows = await db.query(
            'SELECT * FROM users WHERE phone = ?', 
            [phone]
        );
        // Trả về dòng đầu tiên nếu thấy, không thì null
        return (rows && rows.length > 0) ? rows[0] : null;
    }

    // 5. Tìm user khớp cả Phone và Password (Dùng để ĐĂNG NHẬP)
    async findByPhoneAndPassword(phone, password) {
        const rows = await db.query(
            'SELECT * FROM users WHERE phone = ? AND password = ?', 
            [phone, password]
        );
        return (rows && rows.length > 0) ? rows[0] : null;
    }

    // 6. Tạo tài khoản local mới (Đăng ký)
    async createLocal(username, phone, password) {
        const result = await db.query(
            'INSERT INTO users (username, phone, password, role) VALUES (?, ?, ?, ?)',
            [username, phone, password, 'viewer']
        );
        if (result && result.insertId) {
            return result.insertId;
        } else if (result[0] && result[0].insertId) {
            return result[0].insertId;
        }
        
        return null; 
    }
}
module.exports = new UserModel();