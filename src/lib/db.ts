import mysql from 'mysql2/promise';

// Prevent multiple pools in development due to hot reloading
const globalForDb = global as unknown as { pool: mysql.Pool };

const pool = globalForDb.pool || (() => {
    console.log('--- Đang khởi tạo Database Pool mới ---');
    return mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT || '3306'),
        waitForConnections: true,
        connectionLimit: 5, // Giảm giới hạn để tránh quá tải
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    });
})();

if (process.env.NODE_ENV !== 'production') {
    if (!globalForDb.pool) {
        globalForDb.pool = pool;
    } else {
        console.log('--- Tái sử dụng Database Pool hiện có ---');
    }
}



export const db = {
    async query<T>(sql: string, params?: any[]): Promise<T> {
        try {
            const [results] = await pool.query(sql, params);
            return results as T;
        } catch (error: any) {
            console.error('Lỗi truy vấn database:', error.message);
            throw error;
        }
    }
};

export default db;
