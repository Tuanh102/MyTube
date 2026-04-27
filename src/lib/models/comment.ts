import db from '../db';

export interface Comment {
  comment_id: number;
  video_id: number;
  user_id: number;
  content: string;
  created_at: string;
  parent_comment_id: number | null;
  channel_id: number | null;
  username: string;
  avatar: string;
  video_title?: string;
  video_thumbnail?: string;
  video_channel_name?: string;
  video_channel_id?: number;
  likes_count: number;
  dislikes_count: number;
  is_liked?: boolean;
  is_disliked?: boolean;
}

export const commentModel = {
  async getCreatorComments(userId: number, filters: { channelId?: number, search?: string, unrepliedOnly?: boolean } = {}): Promise<Comment[]> {
    let whereClause = `WHERE c.user_id = ?`;
    const params: any[] = [userId];

    if (filters.channelId) {
      whereClause += ' AND c.channel_id = ?';
      params.push(filters.channelId);
    }

    if (filters.search) {
      whereClause += ' AND (cm.content LIKE ? OR u.username LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const sql = `
      SELECT 
        cm.*, 
        COALESCE(ch_author.channel_name, u.username) as username, 
        COALESCE(ch_author.avatar_url, u.avatar) as avatar,
        v.title as video_title,
        v.thumbnail_url as video_thumbnail,
        c.channel_name as video_channel_name,
        c.channel_id as video_channel_id,
        (SELECT COUNT(*) FROM comment_interactions WHERE comment_id = cm.comment_id AND type = 'like') as likes_count,
        (SELECT COUNT(*) FROM comment_interactions WHERE comment_id = cm.comment_id AND type = 'dislike') as dislikes_count,
        EXISTS(SELECT 1 FROM comment_interactions WHERE comment_id = cm.comment_id AND user_id = ? AND type = 'like') as is_liked,
        EXISTS(SELECT 1 FROM comment_interactions WHERE comment_id = cm.comment_id AND user_id = ? AND type = 'dislike') as is_disliked,
        (SELECT COALESCE(ch_p.channel_name, u_p.username) FROM comments cm_p 
         JOIN users u_p ON cm_p.user_id = u_p.user_id 
         LEFT JOIN channels ch_p ON cm_p.channel_id = ch_p.channel_id
         WHERE cm_p.comment_id = cm.parent_comment_id) as parent_username,
        (NOT EXISTS (
          SELECT 1 FROM comments cm2 
          WHERE cm2.parent_comment_id = cm.comment_id 
          AND (cm2.user_id = ? OR cm2.channel_id IN (SELECT channel_id FROM channels WHERE user_id = ?))
        )) as is_unreplied
      FROM comments cm
      JOIN users u ON cm.user_id = u.user_id
      LEFT JOIN channels ch_author ON cm.channel_id = ch_author.channel_id
      JOIN videos v ON cm.video_id = v.video_id
      JOIN channels c ON v.channel_id = c.channel_id
      ${whereClause}
      ORDER BY 
        ${filters.unrepliedOnly ? 'is_unreplied DESC,' : ''} 
        cm.created_at DESC
    `;
    
    return await db.query<Comment[]>(sql, [userId, userId, userId, userId, ...params]);
  },

  async createComment(data: { 
    video_id: number, 
    user_id: number, 
    content: string, 
    parent_comment_id?: number | null,
    channel_id?: number | null 
  }): Promise<number> {
    const sql = `
      INSERT INTO comments (video_id, user_id, content, parent_comment_id, channel_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result: any = await db.query(sql, [
      data.video_id, 
      data.user_id, 
      data.content, 
      data.parent_comment_id || null,
      data.channel_id || null
    ]);
    return result.insertId;
  },

  async deleteComment(commentId: number, creatorUserId: number): Promise<boolean> {
    const verifySql = `
      SELECT cm.comment_id
      FROM comments cm
      JOIN videos v ON cm.video_id = v.video_id
      JOIN channels c ON v.channel_id = c.channel_id
      WHERE cm.comment_id = ? AND c.user_id = ?
    `;
    const results = await db.query<any[]>(verifySql, [commentId, creatorUserId]);
    
    if (results.length === 0) return false;

    const deleteSql = 'DELETE FROM comments WHERE comment_id = ?';
    const result: any = await db.query(deleteSql, [commentId]);
    return result.affectedRows > 0;
  },

  async getVideoComments(videoId: number, userId?: number): Promise<Comment[]> {
    const sql = `
      SELECT 
        cm.*, 
        COALESCE(ch_author.channel_name, u.username) as username, 
        COALESCE(ch_author.avatar_url, u.avatar) as avatar,
        (SELECT COUNT(*) FROM comment_interactions WHERE comment_id = cm.comment_id AND type = 'like') as likes_count,
        (SELECT COUNT(*) FROM comment_interactions WHERE comment_id = cm.comment_id AND type = 'dislike') as dislikes_count
        ${userId ? `, (SELECT COUNT(*) FROM comment_interactions WHERE comment_id = cm.comment_id AND user_id = ? AND type = 'like') > 0 as is_liked` : ''}
        ${userId ? `, (SELECT COUNT(*) FROM comment_interactions WHERE comment_id = cm.comment_id AND user_id = ? AND type = 'dislike') > 0 as is_disliked` : ''}
      FROM comments cm
      JOIN users u ON cm.user_id = u.user_id
      LEFT JOIN channels ch_author ON cm.channel_id = ch_author.channel_id
      WHERE cm.video_id = ?
      ORDER BY cm.created_at DESC
    `;
    
    const params = userId ? [userId, userId, videoId] : [videoId];
    return await db.query<Comment[]>(sql, params);
  }
};

