import db from '../db';

export const userModel = {
  async getFollowedChannels(userId: number) {
    const sql = `
      SELECT 
        c.channel_id, 
        c.channel_name, 
        COALESCE(NULLIF(c.avatar_url, ''), u.avatar) as avatar,
        (SELECT COUNT(*) FROM subscriptions WHERE channel_id = c.channel_id) as sub_count
      FROM subscriptions s
      JOIN channels c ON s.channel_id = c.channel_id
      JOIN users u ON c.user_id = u.user_id
      WHERE s.user_id = ?
      ORDER BY s.subscribed_at DESC
    `;
    return await db.query<any[]>(sql, [userId]);
  },


  async findByPhone(phone: string) {
    const rows = await db.query<any[]>('SELECT * FROM users WHERE phone = ?', [phone]);
    return rows.length > 0 ? rows[0] : null;
  },

  async findByPhoneAndPassword(phone: string, password: string) {
    const rows = await db.query<any[]>('SELECT * FROM users WHERE phone = ? AND password = ?', [phone, password]);
    return rows.length > 0 ? rows[0] : null;
  },

  async findByGoogleId(googleId: string) {
    const rows = await db.query<any[]>('SELECT * FROM users WHERE google_id = ?', [googleId]);
    return rows.length > 0 ? rows[0] : null;
  },

  async findById(id: number | string) {
    const rows = await db.query<any[]>('SELECT * FROM users WHERE user_id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  async createLocal(username: string, phone: string, password: string) {
    const result = await db.query<any>(
      'INSERT INTO users (username, phone, password, role) VALUES (?, ?, ?, ?)',
      [username, phone, password, 'viewer']
    );
    return result.insertId;
  },

  async createFromGoogle(data: { google_id: string; username: string; email: string; avatar: string }) {
    const { google_id, username, email, avatar } = data;
    const safeUsername = `${username}_${google_id.slice(-4)}`;

    await db.query(
      `INSERT INTO users (google_id, username, email, avatar, role)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
          username = VALUES(username),
          email = VALUES(email),
          avatar = VALUES(avatar)`,
      [google_id, safeUsername, email, avatar, 'viewer']
    );
    const user = await this.findByGoogleId(google_id);
    return user.user_id;
  }
};
