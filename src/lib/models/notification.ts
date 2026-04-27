import db from '../db';

export const notificationModel = {
  async getNotifications(userId: number, filter: string = 'all') {
    let sql = `
      SELECT n.*, u.username as actor_name, u.avatar as actor_avatar, v.title as video_title, v.thumbnail_url as video_thumb
      FROM notifications n
      JOIN users u ON n.actor_id = u.user_id
      LEFT JOIN videos v ON n.target_id = v.video_id AND n.type IN ('new_video', 'like', 'comment', 'reply')
      WHERE n.user_id = ?
    `;
    
    if (filter === 'unread') {
      sql += ' AND n.is_read = 0';
    }
    
    sql += ' ORDER BY n.created_at DESC';
    
    return await db.query<any[]>(sql, [userId]);
  },

  async countUnread(userId: number) {
    const sql = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0';
    const rows = await db.query<any[]>(sql, [userId]);
    return rows[0]?.count || 0;
  },

  async markAllAsRead(userId: number) {
    const sql = 'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0';
    return await db.query(sql, [userId]);
  },

  async markAsRead(notificationId: number, userId: number) {
    const sql = 'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?';
    return await db.query(sql, [notificationId, userId]);
  },

  async deleteNotification(notificationId: number, userId: number) {
    const sql = 'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?';
    return await db.query(sql, [notificationId, userId]);
  },

  async clearAllNotifications(userId: number) {
    const sql = 'DELETE FROM notifications WHERE user_id = ?';
    return await db.query(sql, [userId]);
  },


  async createNotification(data: {
    user_id: number;
    actor_id: number;
    type: 'new_video' | 'like' | 'comment' | 'reply' | 'subscription';
    target_id?: number;
    message?: string;
  }) {
    // Safety check: Don't notify the user about their own actions
    if (data.user_id === data.actor_id) return { success: true, message: 'Self-notification blocked' };

    const sql = `
      INSERT INTO notifications (user_id, actor_id, type, target_id, message)
      VALUES (?, ?, ?, ?, ?)
    `;

    return await db.query(sql, [
      data.user_id,
      data.actor_id,
      data.type,
      data.target_id || null,
      data.message || null
    ]);
  }
};


