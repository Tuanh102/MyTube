// Import kết nối database (MySQL / MariaDB)
const db = require('../configs/database');

class VideoModel {

    /*=========================================================
        HÀM GỐC (BASE) - Xử lý truy vấn SQL dùng chung
    =========================================================*/
    async getVideosBase(conditions = "", params = []) {
        const sql = `
            SELECT 
                v.*, 
                c.channel_name, 
                u.avatar AS channel_avatar
            FROM videos v
            LEFT JOIN channels c ON v.channel_id = c.channel_id
            LEFT JOIN users u ON c.user_id = u.user_id
            ${conditions}
            ORDER BY v.video_id DESC
        `;
        const rows = await db.query(sql, params);
        return rows; 
    }

    /*=========================================================
        1. Lấy tất cả video (Trả về Mảng [])
    =========================================================*/
    async getAllVideos() {
        try {
            const videos = await this.getVideosBase();
            return videos; // Trả về danh sách cho trang chủ
        } catch (error) {
            console.error("Lỗi getAllVideos:", error);
            return [];
        }
    }

    /*=========================================================
        2. Lấy 1 video theo ID (Trả về Đối tượng {})
    =========================================================*/
    async getVideoById(videoId) {
        try {
            const results = await this.getVideosBase("WHERE v.video_id = ?", [videoId]);
            // Quan trọng: Phải trả về phần tử đầu tiên [0] vì kết quả là mảng
            return (results && results.length > 0) ? results[0] : null;
        } catch (error) {
            console.error("Lỗi getVideoById:", error);
            return null;
        }
    }

    /* =========================================================
        LIKE SYSTEM
    ========================================================= */

    // Kiểm tra user đã like video chưa
    async checkUserLike(videoId, userId) {
        const rows = await db.query(
            'SELECT 1 FROM video_likes WHERE video_id = ? AND user_id = ? LIMIT 1',
            [videoId, userId]
        );
        return rows.length > 0;
    }

    // Thêm like
    async addLike(videoId, userId) {
        return await db.query(
            'INSERT INTO video_likes (video_id, user_id) VALUES (?, ?)',
            [videoId, userId]
        );
    }

    // Xóa like
    async removeLike(videoId, userId) {
        return await db.query(
            'DELETE FROM video_likes WHERE video_id = ? AND user_id = ?',
            [videoId, userId]
        );
    }

    // Đếm tổng like của video
    async countLikes(videoId) {
        const rows = await db.query(
            'SELECT COUNT(*) AS total FROM video_likes WHERE video_id = ?',
            [videoId]
        );
        return rows[0].total;
    }

    // Toggle like (tiện dùng cho controller)
    async toggleLike(videoId, userId) {
        const liked = await this.checkUserLike(videoId, userId);

        if (liked) {
            await this.removeLike(videoId, userId);
            return false; // đã unlike
        } else {
            await this.addLike(videoId, userId);
            return true; // đã like
        }
    }


    /* =========================================================
        COMMENT SYSTEM
    ========================================================= */

    // Lấy danh sách comment theo video
    async getComments(videoId) {
        const rows = await db.query(
            `SELECT 
                c.comment_id,
                c.content,
                c.created_at,
                u.user_id,
                u.username,
                u.avatar
             FROM comments c
             JOIN users u ON c.user_id = u.user_id
             WHERE c.video_id = ?
             ORDER BY c.created_at DESC`,
            [videoId]
        );
        return rows;
    }

    // Tạo comment
    async createComment(videoId, userId, content) {
        return await db.query(
            `INSERT INTO comments (video_id, user_id, content, created_at)
             VALUES (?, ?, ?, NOW())`,
            [videoId, userId, content]
        );
    }

    // Xóa comment (chỉ owner)
    async deleteComment(commentId, userId) {
        return await db.query(
            'DELETE FROM comments WHERE comment_id = ? AND user_id = ?',
            [commentId, userId]
        );
    }

    // Đếm comment
    async countComments(videoId) {
        const rows = await db.query(
            'SELECT COUNT(*) AS total FROM comments WHERE video_id = ?',
            [videoId]
        );
        return rows[0].total;
    }


    /* =========================================================
        FOLLOW SYSTEM
    ========================================================= */

    // Kiểm tra đã follow channel chưa
    async checkFollow(channelId, followerId) {
        const rows = await db.query(
            'SELECT 1 FROM follows WHERE channel_id = ? AND follower_id = ? LIMIT 1',
            [channelId, followerId]
        );
        return rows.length > 0;
    }

    // Follow channel
    async followChannel(channelId, followerId) {
        return await db.query(
            'INSERT INTO follows (channel_id, follower_id) VALUES (?, ?)',
            [channelId, followerId]
        );
    }

    // Unfollow channel
    async unfollowChannel(channelId, followerId) {
        return await db.query(
            'DELETE FROM follows WHERE channel_id = ? AND follower_id = ?',
            [channelId, followerId]
        );
    }

    // Toggle follow
    async toggleFollow(channelId, followerId) {
        const isFollowed = await this.checkFollow(channelId, followerId);

        if (isFollowed) {
            await this.unfollowChannel(channelId, followerId);
            return false;
        } else {
            await this.followChannel(channelId, followerId);
            return true;
        }
    }

    // Đếm follower của channel
    async countFollowers(channelId) {
        const rows = await db.query(
            'SELECT COUNT(*) AS total FROM follows WHERE channel_id = ?',
            [channelId]
        );
        return rows[0].total;
    }
}
module.exports = new VideoModel();