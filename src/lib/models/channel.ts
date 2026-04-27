import db from '../db';

export interface Channel {
  channel_id: number;
  user_id: number;
  channel_name: string;
  description: string;
  avatar_url: string;
  is_verified: boolean;
  created_at: string;
}

export const channelModel = {
  async getUserChannels(userId: number): Promise<Channel[]> {
    const sql = 'SELECT * FROM channels WHERE user_id = ?';
    return await db.query<Channel[]>(sql, [userId]);
  },

  async createChannel(userId: number, name: string, description: string = ''): Promise<number> {
    // Check limit
    const channels = await this.getUserChannels(userId);
    if (channels.length >= 3) {
      throw new Error('Mỗi tài khoản chỉ được tạo tối đa 3 kênh');
    }

    const sql = 'INSERT INTO channels (user_id, channel_name, description, avatar_url) VALUES (?, ?, ?, ?)';
    const result: any = await db.query(sql, [userId, name, description, '/assets/img/default-channel-avatar.jpg']);
    return result.insertId;
  },

  async getChannelCount(userId: number): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM channels WHERE user_id = ?';
    const result: any = await db.query(sql, [userId]);
    return result[0].count;
  },

  async getUserTotalSubscribers(userId: number, channelId?: number): Promise<number> {
    let whereClause = 'WHERE c.user_id = ?';
    const params = [userId];
    
    if (channelId) {
      whereClause += ' AND c.channel_id = ?';
      params.push(channelId);
    }

    const sql = `
      SELECT COUNT(s.user_id) as totalSubscribers
      FROM subscriptions s
      JOIN channels c ON s.channel_id = c.channel_id
      ${whereClause}
    `;
    const result: any = await db.query(sql, params);
    return Number(result[0]?.totalSubscribers || 0);
  },

  async getTopChannelByUser(userId: number): Promise<Channel & { sub_count: number } | null> {
    const sql = `
      SELECT c.*, COUNT(s.user_id) as sub_count
      FROM channels c
      LEFT JOIN subscriptions s ON c.channel_id = s.channel_id
      WHERE c.user_id = ?
      GROUP BY c.channel_id
      ORDER BY sub_count DESC, c.created_at ASC
      LIMIT 1
    `;
    const result = await db.query<any[]>(sql, [userId]);
    return result.length > 0 ? result[0] : null;
  },

  async updateChannel(channelId: number, name: string, description: string, avatarUrl?: string): Promise<boolean> {
    let sql = 'UPDATE channels SET channel_name = ?, description = ?';
    const params = [name, description];

    if (avatarUrl) {
      sql += ', avatar_url = ?';
      params.push(avatarUrl);
    }

    sql += ' WHERE channel_id = ?';
    params.push(channelId);

    const result: any = await db.query(sql, params);
    return result.affectedRows > 0;
  },

  async deleteChannel(channelId: number): Promise<boolean> {
    const sql = 'DELETE FROM channels WHERE channel_id = ?';
    const result: any = await db.query(sql, [channelId]);
    return result.affectedRows > 0;
  },

  async getChannelSubscribers(channelId: number): Promise<{ user_id: number }[]> {
    const sql = 'SELECT user_id FROM subscriptions WHERE channel_id = ?';
    return await db.query<any[]>(sql, [channelId]);
  }
};


