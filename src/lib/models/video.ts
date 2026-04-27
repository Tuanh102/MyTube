import db from '../db';

export interface Video {
  video_id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  view_count: number;
  channel_id: number;
  category_id: number;
  channel_name: string;
  channel_avatar: string;
  uploaded_at: string;
}

export const videoModel = {
  async getAllVideos(filters: { search?: string, categoryId?: number } = {}): Promise<Video[]> {
    let whereConditions = [];
    const params: any[] = [];
    
    if (filters.search) {
      whereConditions.push('(v.title LIKE ? OR c.channel_name LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (filters.categoryId) {
      whereConditions.push('v.category_id = ?');
      params.push(filters.categoryId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
          v.*, 
          c.channel_name, 
          COALESCE(NULLIF(c.avatar_url, ''), u.avatar) AS channel_avatar
      FROM videos v
      LEFT JOIN channels c ON v.channel_id = c.channel_id
      LEFT JOIN users u ON c.user_id = u.user_id
      ${whereClause}
      ORDER BY v.video_id DESC
    `;
    return await db.query<Video[]>(sql, params);
  },


  async getVideoById(id: string | number, userId?: number): Promise<Video | null> {
    const sql = `
      SELECT 
          v.*, 
          c.channel_name, 
          COALESCE(NULLIF(c.avatar_url, ''), u.avatar) AS channel_avatar,
          (SELECT COUNT(*) FROM video_interactions WHERE video_id = v.video_id AND type = 'like') as likes_count,
          (SELECT COUNT(*) FROM comments WHERE video_id = v.video_id) as comments_count,
          (SELECT COUNT(*) FROM subscriptions WHERE channel_id = v.channel_id) as sub_count,
          EXISTS(SELECT 1 FROM video_interactions WHERE video_id = v.video_id AND user_id = ? AND type = 'like') as is_liked,
          EXISTS(SELECT 1 FROM subscriptions WHERE channel_id = v.channel_id AND user_id = ?) as is_followed
      FROM videos v
      LEFT JOIN channels c ON v.channel_id = c.channel_id
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE v.video_id = ?
    `;
    const results = await db.query<Video[]>(sql, [userId || 0, userId || 0, id]);
    return results.length > 0 ? results[0] : null;
  },


  async getRelatedVideos(videoId: string | number, categoryId: number): Promise<Video[]> {
    const sql = `
      SELECT v.*, c.channel_name, COALESCE(NULLIF(c.avatar_url, ''), u.avatar) AS channel_avatar
      FROM videos v
      LEFT JOIN channels c ON v.channel_id = c.channel_id
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE v.video_id != ? AND (v.category_id = ? OR 1=1)
      ORDER BY (v.category_id = ?) DESC, RAND()
      LIMIT 10
    `;
    return await db.query<Video[]>(sql, [videoId, categoryId, categoryId]);
  },

  async getShorts(): Promise<ShortVideo[]> {
    const sql = `
      SELECT 
          v.*, 
          c.channel_name, 
          COALESCE(NULLIF(c.avatar_url, ''), u.avatar) AS channel_avatar,
          (SELECT COUNT(*) FROM video_interactions WHERE video_id = v.video_id AND type = 'like') as likes_count,
          (SELECT COUNT(*) FROM comments WHERE video_id = v.video_id) as comments_count
      FROM videos v
      LEFT JOIN channels c ON v.channel_id = c.channel_id
      LEFT JOIN users u ON c.user_id = u.user_id
      JOIN categories cat ON v.category_id = cat.category_id
      WHERE cat.category_name = 'shorts' OR v.category_id = 1
      ORDER BY v.uploaded_at DESC
    `;
    return await db.query<ShortVideo[]>(sql);
  },

  async getWatchHistory(userId: number): Promise<Video[]> {
    const sql = `
      SELECT v.*, c.channel_name, COALESCE(NULLIF(c.avatar_url, ''), u.avatar) AS channel_avatar, h.watched_at
      FROM watch_history h
      JOIN videos v ON h.video_id = v.video_id
      LEFT JOIN channels c ON v.channel_id = c.channel_id
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE h.user_id = ?
      ORDER BY h.watched_at DESC
    `;
    return await db.query<Video[]>(sql, [userId]);
  },

  async getLikedVideos(userId: number): Promise<Video[]> {
    const sql = `
      SELECT v.*, c.channel_name, COALESCE(NULLIF(c.avatar_url, ''), u.avatar) AS channel_avatar
      FROM video_interactions vi
      JOIN videos v ON vi.video_id = v.video_id
      LEFT JOIN channels c ON v.channel_id = c.channel_id
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE vi.user_id = ? AND vi.type = 'like'
      ORDER BY vi.created_at DESC
    `;
    return await db.query<Video[]>(sql, [userId]);
  },

  async createVideo(videoData: {
    channel_id: number;
    category_id: number;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
    duration?: number;
    is_short?: boolean;
  }): Promise<number> {
    const sql = `
      INSERT INTO videos (channel_id, category_id, title, description, video_url, thumbnail_url, duration, is_short)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result: any = await db.query(sql, [
      videoData.channel_id,
      videoData.category_id,
      videoData.title,
      videoData.description,
      videoData.video_url,
      videoData.thumbnail_url,
      videoData.duration || 0,
      videoData.is_short || 0
    ]);
    return result.insertId;
  },

  async getVideosByUserId(userId: number, channelId?: number, searchQuery?: string): Promise<Video[]> {
    let whereClause = 'WHERE u.user_id = ?';
    const params: any[] = [userId];

    if (channelId) {
      whereClause += ' AND v.channel_id = ?';
      params.push(channelId);
    }

    if (searchQuery) {
      whereClause += ' AND (v.title LIKE ? OR v.description LIKE ?)';
      params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    const sql = `
      SELECT v.*, c.channel_name, COALESCE(NULLIF(c.avatar_url, ''), u.avatar) AS channel_avatar
      FROM videos v
      JOIN channels c ON v.channel_id = c.channel_id
      JOIN users u ON c.user_id = u.user_id
      ${whereClause}
      ORDER BY v.uploaded_at DESC
    `;
    return await db.query<Video[]>(sql, params);
  },

  async updateVideo(videoId: number, videoData: any): Promise<boolean> {
    const fields = [];
    const values = [];
    
    if (videoData.title !== undefined) { fields.push('title = ?'); values.push(videoData.title); }
    if (videoData.description !== undefined) { fields.push('description = ?'); values.push(videoData.description); }
    if (videoData.category_id !== undefined) { fields.push('category_id = ?'); values.push(videoData.category_id); }
    if (videoData.thumbnail_url !== undefined) { fields.push('thumbnail_url = ?'); values.push(videoData.thumbnail_url); }
    
    if (fields.length === 0) return false;
    
    const sql = `UPDATE videos SET ${fields.join(', ')} WHERE video_id = ?`;
    values.push(videoId);
    
    await db.query(sql, values);
    return true;
  },

  async deleteVideo(videoId: number): Promise<boolean> {
    const sql = `DELETE FROM videos WHERE video_id = ?`;
    await db.query(sql, [videoId]);
    return true;
  },

  async incrementViewCount(videoId: number): Promise<boolean> {
    const sql = `UPDATE videos SET view_count = view_count + 1 WHERE video_id = ?`;
    await db.query(sql, [videoId]);
    return true;
  },

  async getUserStats(userId: number, channelId?: number): Promise<{ totalViews: number, totalVideos: number, totalInteractions: number }> {
    let whereClause = 'WHERE c.user_id = ?';
    const params = [userId, userId, userId];
    
    if (channelId) {
      whereClause += ' AND c.channel_id = ?';
      params.splice(2, 0, channelId); // Insert for the main query
      params.splice(0, 0, channelId); // Insert for interaction subquery
      params.splice(1, 0, channelId); // Insert for comments subquery
    }

    const sql = `
      SELECT 
        COUNT(v.video_id) as totalVideos,
        SUM(v.view_count) as totalViews,
        (
          SELECT COUNT(*) 
          FROM video_interactions vi 
          JOIN videos v2 ON vi.video_id = v2.video_id 
          JOIN channels c2 ON v2.channel_id = c2.channel_id 
          WHERE c2.user_id = ? ${channelId ? 'AND c2.channel_id = ?' : ''}
        ) + 
        (
          SELECT COUNT(*) 
          FROM comments cm 
          JOIN videos v3 ON cm.video_id = v3.video_id 
          JOIN channels c3 ON v3.channel_id = c3.channel_id 
          WHERE c3.user_id = ? ${channelId ? 'AND c3.channel_id = ?' : ''}
        ) as totalInteractions
      FROM videos v
      JOIN channels c ON v.channel_id = c.channel_id
      ${whereClause}
    `;
    const result = await db.query<any[]>(sql, params);
    return {
      totalViews: Number(result[0]?.totalViews || 0),
      totalVideos: Number(result[0]?.totalVideos || 0),
      totalInteractions: Number(result[0]?.totalInteractions || 0)
    };
  },

  async getTopVideosByUser(userId: number, limit: number = 5, channelId?: number): Promise<Video[]> {
    let whereClause = 'WHERE c.user_id = ?';
    const params: any[] = [userId];
    
    if (channelId) {
      whereClause += ' AND c.channel_id = ?';
      params.push(channelId);
    }
    
    params.push(limit);

    const sql = `
      SELECT v.*, c.channel_name, COALESCE(NULLIF(c.avatar_url, ''), u.avatar) AS channel_avatar,
        (SELECT COUNT(*) FROM video_interactions WHERE video_id = v.video_id AND type = 'like') as likes_count
      FROM videos v
      JOIN channels c ON v.channel_id = c.channel_id
      JOIN users u ON c.user_id = u.user_id
      ${whereClause}
      ORDER BY v.view_count DESC, v.uploaded_at DESC
      LIMIT ?
    `;
    return await db.query<Video[]>(sql, params);
  },

  async getLikedVideos(userId: number): Promise<Video[]> {
    const sql = `
      SELECT v.*, c.channel_name, COALESCE(NULLIF(c.avatar_url, ''), u.avatar) AS channel_avatar,
        (SELECT COUNT(*) FROM video_interactions WHERE video_id = v.video_id AND type = 'like') as likes_count
      FROM videos v
      JOIN video_interactions vi ON v.video_id = vi.video_id
      JOIN channels c ON v.channel_id = c.channel_id
      JOIN users u ON c.user_id = u.user_id
      WHERE vi.user_id = ? AND vi.type = 'like'
      ORDER BY vi.created_at DESC
    `;
    return await db.query<Video[]>(sql, [userId]);
  },

  async getSavedVideos(userId: number): Promise<Video[]> {
    const sql = `
      SELECT v.*, c.channel_name, COALESCE(NULLIF(c.avatar_url, ''), u.avatar) AS channel_avatar,
        (SELECT COUNT(*) FROM video_interactions WHERE video_id = v.video_id AND type = 'like') as likes_count
      FROM videos v
      JOIN playlist_videos pv ON v.video_id = pv.video_id
      JOIN playlists p ON pv.playlist_id = p.playlist_id
      JOIN channels c ON v.channel_id = c.channel_id
      JOIN users u ON c.user_id = u.user_id
      WHERE p.user_id = ?
      ORDER BY pv.added_at DESC
    `;
    return await db.query<Video[]>(sql, [userId]);
  },

  async getVideosByPlaylist(playlistId: number): Promise<Video[]> {
    const sql = `
      SELECT v.*, c.channel_name, COALESCE(NULLIF(c.avatar_url, ''), u.avatar) AS channel_avatar,
        (SELECT COUNT(*) FROM video_interactions WHERE video_id = v.video_id AND type = 'like') as likes_count
      FROM videos v
      JOIN playlist_videos pv ON v.video_id = pv.video_id
      JOIN channels c ON v.channel_id = c.channel_id
      JOIN users u ON c.user_id = u.user_id
      WHERE pv.playlist_id = ?
      ORDER BY pv.added_at DESC
    `;
    return await db.query<Video[]>(sql, [playlistId]);
  }
};




export interface ShortVideo {
  video_id: number;
  title: string;
  video_url: string;
  channel_name: string;
  channel_avatar: string;
  likes_count: number;
  comments_count: number;
  isLiked?: boolean;
}
