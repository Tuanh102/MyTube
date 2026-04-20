const videoModel = require('../models/videoModel');
const videoService = require('../services/videoService');

class videoController {
    // 1. Hiển thị trang chủ
    async getHomePage(req, res) {
        try {
            const videos = await videoModel.getAllVideos();
            return res.render('page/home.ejs', {
                title: 'Trang chủ',
                videos: videos 
            });
        } catch (error) {
            console.error("Lỗi lấy video tại controller:", error);
            return res.render('page/home.ejs', { title: 'Trang chủ', videos: [] });
        }
    }

    // 2. Hiển thị trang xem chi tiết
    async getWatchPage(req, res) {
        try {
            const videoId = req.params.id;
            const userId = req.user?.user_id || null;

            // Service lo hết việc đếm like, check follow, lấy comment...
            const details = await videoService.getVideoDetails(videoId, userId);

            if (!details) {
                return res.status(404).render('page/404', { title: 'Không tìm thấy video' });
            }

            const allVideos = await videoModel.getAllVideos();

            res.render('page/watch', {
                title: details.video.title,
                video: details.video,
                likes: details.likesCount,
                commentCount: details.commentsCount,
                comments: details.commentsList,
                isLiked: details.isLiked,
                isFollowed: details.isFollowed,
                suggestedVideos: allVideos.filter(v => v.video_id != videoId)
            });
        } catch (error) {
            console.error(error);
            res.status(500).send("Lỗi hiển thị video");
        }
    }

    // 3. API Like - Dùng Service để tính toán
    async likeVideo(req, res) {
        try {
            const result = await videoService.handleToggleLike(req.params.id, req.user.user_id);
            res.json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 4. API Comment - Dùng Service
    async postComment(req, res) {
        try {
            const result = await videoService.handleAddComment(req.params.id, req.user.user_id, req.body.content);
            res.json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 5. API Follow - Dùng Service
    async toggleFollow(req, res) {
        try {
            const result = await videoService.handleToggleFollow(req.body.channelId, req.user.user_id);
            res.json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new videoController();