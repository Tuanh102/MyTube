const videoModel = require('../models/videoModel');

class HomeController {
	async getHomePage(req, res) {
		try {
			// Lấy tất cả video từ bảng 'videos'
			const videos = await videoModel.getAllVideos();
			return res.render('page/home.ejs', {
				title: 'Trang chủ MyTube',
				videos: videos // Truyền danh sách video vào View
			});
		} catch (error) {
			console.error("Lỗi lấy video tại controller:", error);
			return res.render('page/home.ejs', {
				title: 'Trang chủ MyTube',
				videos: [] // Nếu lỗi thì trả về mảng rỗng
			});
		}
	}
}

module.exports = new HomeController();
