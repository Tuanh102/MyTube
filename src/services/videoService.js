const videoModel = require('../models/videoModel');

class VideoService {
    /**
     * Lấy toàn bộ dữ liệu cần thiết cho trang xem video
     * Bao gồm: Thông tin video, đếm like, đếm comment, danh sách comment, check trạng thái user
     */
    async getVideoDetails(videoId, userId = null) {
        // Sử dụng Promise.all để lấy dữ liệu song song, tăng tốc độ tải trang
        const [video, likesCount, commentsCount, commentsList] = await Promise.all([
            videoModel.getVideoById(videoId),
            videoModel.countLikes(videoId),
            videoModel.countComments(videoId),
            videoModel.getComments(videoId)
        ]);

        if (!video) return null;

        // Kiểm tra trạng thái của User hiện tại nếu đã đăng nhập
        let isLiked = false;
        let isFollowed = false;

        if (userId) {
            [isLiked, isFollowed] = await Promise.all([
                videoModel.checkUserLike(videoId, userId),
                videoModel.checkFollow(video.channel_id, userId)
            ]);
        }

        return {
            video,
            likesCount,
            commentsCount,
            commentsList,
            isLiked,
            isFollowed
        };
    }

    /**
     * Xử lý logic Like/Unlike và trả về số lượng like mới (nếu cần)
     */
    async handleToggleLike(videoId, userId) {
        const isLikedNow = await videoModel.toggleLike(videoId, userId);
        const newLikeCount = await videoModel.countLikes(videoId);
        
        return {
            isLiked: isLikedNow,
            likeCount: newLikeCount
        };
    }

    /**
     * Xử lý logic Đăng ký/Hủy đăng ký kênh
     */
    async handleToggleFollow(channelId, followerId) {
        // Không cho phép tự follow chính mình (Logic nghiệp vụ nằm ở đây)
        // Lưu ý: Controller nên check channelId của user trước khi gọi service
        
        const isFollowedNow = await videoModel.toggleFollow(channelId, followerId);
        const newFollowerCount = await videoModel.countFollowers(channelId);

        return {
            isFollowed: isFollowedNow,
            followerCount: newFollowerCount
        };
    }

    /**
     * Xử lý thêm bình luận và trả về danh sách đã cập nhật hoặc comment mới
     */
    async handleAddComment(videoId, userId, content) {
        if (!content || content.trim() === '') {
            throw new Error('Nội dung bình luận không hợp lệ');
        }

        await videoModel.createComment(videoId, userId, content);
        const newCommentCount = await videoModel.countComments(videoId);
        
        return {
            success: true,
            commentCount: newCommentCount
        };
    }
}

module.exports = new VideoService();