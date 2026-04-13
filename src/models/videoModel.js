const db = require('../configs/database');

class VideoModel {
	async getAllVideos() {
		try {
			const video = await db.query('SELECT * FROM videos ORDER BY video_id DESC');
			return videos;
		} catch (error) {
			console.error("Lỗi lấy video tại moldel:", error);
			return [];
		}
	}
}

module.exports = new VideoModel();