import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mytube_db',
  });

  console.log('Đang bắt đầu cập nhật cấu trúc bảng comments...');

  try {
    // 1. Thêm cột channel_id
    await connection.query(`
      ALTER TABLE comments 
      ADD COLUMN channel_id INT(11) DEFAULT NULL AFTER user_id
    `);
    console.log('- Đã thêm cột channel_id');

    // 2. Thêm khóa ngoại
    await connection.query(`
      ALTER TABLE comments 
      ADD CONSTRAINT fk_comment_channel 
      FOREIGN KEY (channel_id) REFERENCES channels(channel_id) 
      ON DELETE SET NULL
    `);
    console.log('- Đã thêm khóa ngoại cho channel_id');

    console.log('Cập nhật database thành công!');
  } catch (error: any) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log('- Cột channel_id đã tồn tại, bỏ qua.');
    } else {
      console.error('Lỗi khi cập nhật database:', error.message);
    }
  } finally {
    await connection.end();
  }
}

migrate();
