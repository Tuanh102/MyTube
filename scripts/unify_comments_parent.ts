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

  console.log('Đang đồng bộ hóa dữ liệu bình luận...');

  try {
    // 1. Chuyển dữ liệu từ parent_id sang parent_comment_id nếu parent_comment_id đang NULL
    await connection.query(`
      UPDATE comments 
      SET parent_comment_id = parent_id 
      WHERE parent_comment_id IS NULL AND parent_id IS NOT NULL
    `);
    console.log('- Đã đồng bộ dữ liệu parent_id sang parent_comment_id');

    // 2. Xóa cột parent_id dư thừa (nếu tồn tại)
    const [cols]: any = await connection.query('DESCRIBE comments');
    if (cols.some((c: any) => c.Field === 'parent_id')) {
      await connection.query('ALTER TABLE comments DROP COLUMN parent_id');
      console.log('- Đã xóa cột parent_id dư thừa');
    }

    console.log('Di chuyển dữ liệu thành công!');
  } catch (error: any) {
    console.error('Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

migrate();
