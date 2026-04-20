const videoModel = require('../src/models/videoModel');

(async () => {
    console.log("===== TEST MODEL =====");

    try {
        // 🔥 TEST 1: getAllVideos
        console.log("\n👉 TEST getAllVideos()");
        const allVideos = await videoModel.getAllVideos();

        console.log("Type:", typeof allVideos);
        console.log("Is Array:", Array.isArray(allVideos));
        console.log("Length:", allVideos.length);
        console.log("Data:", allVideos);

        // 🔥 TEST 2: getVideoById
        console.log("\n👉 TEST getVideoById(1)");
        const video = await videoModel.getVideoById(1);

        console.log("Type:", typeof video);
        console.log("Data:", video);

    } catch (error) {
        console.error("❌ Lỗi test:", error);
    }

    console.log("\n===== END TEST =====");
})();