const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/authMiddleware');

// --- CÁC ROUTE CÔNG KHAI (Ai cũng xem được) ---
router.get('/', videoController.getHomePage);
router.get('/watch/:id', videoController.getWatchPage);

// --- CÁC ROUTE CẦN ĐĂNG NHẬP (Phải đi qua authMiddleware.isLoggedIn) ---

// 1. Like video
router.post('/api/videos/:id/like', authMiddleware.isLoggedIn, videoController.likeVideo);

// 2. Bình luận
router.post('/api/videos/:id/comments', authMiddleware.isLoggedIn, videoController.postComment);

// 3. Theo dõi kênh
router.post('/api/channels/follow', authMiddleware.isLoggedIn, videoController.toggleFollow);

module.exports = router;