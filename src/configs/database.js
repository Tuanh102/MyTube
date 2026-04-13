const mysql = require('mysql2/promise');
require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

class Database {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,

            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        this.checkConnection();
    }

    async checkConnection() {
        try {
            const connection = await this.pool.getConnection();
            console.log('Kết nối database MyTube thành công!');
            connection.release();
        } catch (error) {
            console.error('Lỗi kết nối database:', error.message);
        }
    }

    async query(sql, params) {
        try {
            const [result] = await this.pool.query(sql, params);
            return result;
        } catch (error) {
            console.error('Lỗi truy vấn database:', error.message);
            throw error;
        }
    }
}

module.exports = new Database();