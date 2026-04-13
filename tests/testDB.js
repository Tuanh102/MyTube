require('dotenv').config();
const db = require('../src/configs/database');

async function testConnection() {
    try {
        console.log("🔄 Đang thử kết nối tới Database...");
        
        // Thực hiện một truy vấn đơn giản nhất
        const result = await db.query("SELECT 1 + 1 AS result");
        
        if (result) {
            console.log("✅ Kết nối thành công! Kết quả test (1+1):", result[0].result);
            
            // Thử lấy danh sách các bảng đã tạo
            const tables = await db.query("SHOW TABLES");
            console.log("📂 Các bảng hiện có trong MyTube:");
            console.table(tables);
        }

    } catch (error) {
        console.error("❌ Lỗi rồi Tuanh ơi! Kiểm tra lại cấu hình nhé:");
        console.error("Chi tiết lỗi:", error.message);
    } finally {
        // Thoát chương trình sau khi test xong
        process.exit();
    }
}

testConnection();