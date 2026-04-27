import db from '../db';

export const playlistModel = {
  async getUserPlaylists(userId: number, videoId?: number) {
    const sql = `
      SELECT p.*, 
        (SELECT COUNT(*) FROM playlist_videos WHERE playlist_id = p.playlist_id) as video_count,
        (
          SELECT v.thumbnail_url 
          FROM playlist_videos pv2 
          JOIN videos v ON pv2.video_id = v.video_id 
          WHERE pv2.playlist_id = p.playlist_id 
          ORDER BY pv2.added_at DESC 
          LIMIT 1
        ) as cover_thumbnail
        ${videoId ? ', EXISTS(SELECT 1 FROM playlist_videos WHERE playlist_id = p.playlist_id AND video_id = ?) as has_video' : ''}
      FROM playlists p
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `;
    const params = videoId ? [videoId, userId] : [userId];
    return await db.query<any[]>(sql, params);
  },



  async createPlaylist(userId: number, name: string, description: string = '', isPrivate: boolean = true) {
    const sql = 'INSERT INTO playlists (user_id, playlist_name, description, is_private) VALUES (?, ?, ?, ?)';
    const result: any = await db.query(sql, [userId, name, description, isPrivate ? 1 : 0]);
    return result.insertId;
  },

  async addVideoToPlaylist(playlistId: number, videoId: number) {
    // Check if exists
    const checkSql = 'SELECT 1 FROM playlist_videos WHERE playlist_id = ? AND video_id = ?';
    const rows = await db.query<any[]>(checkSql, [playlistId, videoId]);
    if (rows.length > 0) return true;

    const sql = 'INSERT INTO playlist_videos (playlist_id, video_id) VALUES (?, ?)';
    return await db.query(sql, [playlistId, videoId]);
  },

  async removeVideoFromPlaylist(playlistId: number, videoId: number) {
    const sql = 'DELETE FROM playlist_videos WHERE playlist_id = ? AND video_id = ?';
    return await db.query(sql, [playlistId, videoId]);
  },

  async isVideoInPlaylist(playlistId: number, videoId: number) {
    const sql = 'SELECT 1 FROM playlist_videos WHERE playlist_id = ? AND video_id = ?';
    const rows = await db.query<any[]>(sql, [playlistId, videoId]);
    return rows.length > 0;
  }
};
