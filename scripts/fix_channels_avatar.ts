import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fix() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mytube_db',
  });

  console.log('Đang đồng bộ hóa tên cột avatar cho bảng channels...');

  try {
    const [cols]: any = await connection.query('DESCRIBE channels');
    const hasBanner = cols.some((c: any) => c.Field === 'banner_url');
    const hasAvatar = cols.some((c: any) => c.Field === 'avatar_url');

    if (hasBanner && !hasAvatar) {
      await connection.query('ALTER TABLE channels CHANGE banner_url avatar_url VARCHAR(255)');
      console.log('- Đã đổi tên cột banner_url thành avatar_url');
    } else if (hasAvatar) {
      console.log('- Cột avatar_url đã tồn tại.');
    } else {
      await connection.query('ALTER TABLE channels ADD COLUMN avatar_url VARCHAR(255) AFTER description');
      console.log('- Đã thêm cột avatar_url mới');
    }

    console.log('Đồng bộ thành công!');
  } catch (error: any) {
    console.error('Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

fix();
