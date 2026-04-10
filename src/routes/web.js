const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Gọi file kết nối DB của Tuanh

router.get('/', async (req, res) => {
    try {
        // Lấy tất cả video từ bảng 'videos' (Tuanh nhớ check tên bảng nhé)
        const [videos] = await db.execute('SELECT * FROM videos ORDER BY createdAt DESC');

        res.render('page/home', { 
            title: 'Trang chủ MyTube',
            videos: videos // Truyền danh sách video vào View
        });
    } catch (error) {
        console.error("Lỗi lấy video:", error);
        res.render('page/home', { 
            title: 'Trang chủ MyTube',
            videos: [] // Nếu lỗi thì trả về mảng rỗng
        });
    }
});

module.exports = router;