"use server";

import { revalidatePath } from "next/cache";
import db from "./db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { notificationModel } from "./models/notification";
import { playlistModel } from "./models/playlist";

export async function toggleLike(videoId: number, userId: number) {
  // Check if liked
  const rows = await db.query<any[]>(
    "SELECT 1 FROM video_interactions WHERE video_id = ? AND user_id = ? AND type = 'like' LIMIT 1",
    [videoId, userId]
  );
  
  const isLiked = rows.length > 0;
  
  if (isLiked) {
    await db.query(
      "DELETE FROM video_interactions WHERE video_id = ? AND user_id = ? AND type = 'like'",
      [videoId, userId]
    );
  } else {
    await db.query(
      "INSERT INTO video_interactions (video_id, user_id, type) VALUES (?, ?, 'like')",
      [videoId, userId]
    );

    // Notify video owner
    try {
      const rows = await db.query<any[]>("SELECT c.user_id FROM videos v JOIN channels c ON v.channel_id = c.channel_id WHERE v.video_id = ?", [videoId]);
      if (rows.length > 0 && rows[0].user_id !== userId) {
        await notificationModel.createNotification({
          user_id: rows[0].user_id,
          actor_id: userId,
          type: 'like',
          target_id: videoId
        });
      }
    } catch (err) {
      console.error('Lỗi khi gửi thông báo like:', err);
    }
  }
  
  revalidatePath(`/watch/${videoId}`);
  return { success: true, isLiked: !isLiked };
}

export async function toggleFollow(channelId: number, userId: number) {
  const rows = await db.query<any[]>(
    'SELECT 1 FROM subscriptions WHERE channel_id = ? AND user_id = ? LIMIT 1',
    [channelId, userId]
  );
  
  const isFollowed = rows.length > 0;
  
  if (isFollowed) {
    await db.query(
      'DELETE FROM subscriptions WHERE channel_id = ? AND user_id = ?',
      [channelId, userId]
    );
  } else {
    await db.query(
      'INSERT INTO subscriptions (channel_id, user_id) VALUES (?, ?)',
      [channelId, userId]
    );

    // Notify channel owner
    try {
      const rows = await db.query<any[]>("SELECT user_id FROM channels WHERE channel_id = ?", [channelId]);
      if (rows.length > 0 && rows[0].user_id !== userId) {
        await notificationModel.createNotification({
          user_id: rows[0].user_id,
          actor_id: userId,
          type: 'subscription',
          target_id: channelId
        });
      }
    } catch (err) {
      console.error('Lỗi khi gửi thông báo sub:', err);
    }
  }
  revalidatePath('/'); // Refresh sidebar
  return { success: true, isFollowed: !isFollowed };
}

export async function toggleCommentInteraction(commentId: number, userId: number, videoId: number, type: 'like' | 'dislike') {
  // Check existing interaction
  const rows = await db.query<any[]>(
    "SELECT type FROM comment_interactions WHERE comment_id = ? AND user_id = ? LIMIT 1",
    [commentId, userId]
  );
  
  if (rows.length > 0) {
    const existingType = rows[0].type;
    
    // Always delete the existing one
    await db.query(
      "DELETE FROM comment_interactions WHERE comment_id = ? AND user_id = ?",
      [commentId, userId]
    );
    
    // If it was a different type, insert the new one
    if (existingType !== type) {
      await db.query(
        "INSERT INTO comment_interactions (comment_id, user_id, type) VALUES (?, ?, ?)",
        [commentId, userId, type]
      );
    }
  } else {
    // New interaction
    await db.query(
      "INSERT INTO comment_interactions (comment_id, user_id, type) VALUES (?, ?, ?)",
      [commentId, userId, type]
    );
  }
  
  revalidatePath(`/watch/${videoId}`);
  return { success: true };
}

export async function submitCommentAction(videoId: number, userId: number, content: string, parentCommentId?: number) {
  if (!content.trim()) return { success: false, error: 'Bình luận không được để trống' };

  await db.query(
    "INSERT INTO comments (video_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)",
    [videoId, userId, content, parentCommentId || null]
  );

  // Notify video owner or parent comment owner
  try {
    if (parentCommentId) {
      const rows = await db.query<any[]>("SELECT user_id FROM comments WHERE comment_id = ?", [parentCommentId]);
      if (rows.length > 0 && rows[0].user_id !== userId) {
        await notificationModel.createNotification({
          user_id: rows[0].user_id,
          actor_id: userId,
          type: 'reply',
          target_id: videoId
        });
      }
    } else {
      const rows = await db.query<any[]>("SELECT c.user_id FROM videos v JOIN channels c ON v.channel_id = c.channel_id WHERE v.video_id = ?", [videoId]);
      if (rows.length > 0 && rows[0].user_id !== userId) {
        await notificationModel.createNotification({
          user_id: rows[0].user_id,
          actor_id: userId,
          type: 'comment',
          target_id: videoId
        });
      }
    }
  } catch (err) {
    console.error('Lỗi khi gửi thông báo comment:', err);
  }

  revalidatePath(`/watch/${videoId}`);
  return { success: true };
}

export async function markNotificationsRead() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };

  await notificationModel.markAllAsRead(Number(session.user.id));
  revalidatePath('/notifications');
  return { success: true };
}

export async function markSingleNotificationRead(id: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };

  await notificationModel.markAsRead(id, Number(session.user.id));
  revalidatePath('/notifications');
  return { success: true };
}

export async function deleteNotificationAction(id: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log('Delete failed: No session user ID');
    return { success: false };
  }

  console.log(`Server Action: Deleting notification ${id} for user ${session.user.id}`);
  const result: any = await notificationModel.deleteNotification(id, Number(session.user.id));
  console.log('Delete DB Result:', result);
  
  revalidatePath('/notifications');
  return { success: true };
}


export async function clearAllNotificationsAction() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };

  await notificationModel.clearAllNotifications(Number(session.user.id));
  revalidatePath('/notifications');
  return { success: true };
}


export async function getUserPlaylistsAction(videoId?: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return await playlistModel.getUserPlaylists(Number(session.user.id), videoId);
}


export async function createPlaylistAction(name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };
  const id = await playlistModel.createPlaylist(Number(session.user.id), name);
  return { success: true, playlistId: id };
}

export async function toggleVideoInPlaylistAction(playlistId: number, videoId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false };

  const isIn = await playlistModel.isVideoInPlaylist(playlistId, videoId);
  if (isIn) {
    await playlistModel.removeVideoFromPlaylist(playlistId, videoId);
  } else {
    await playlistModel.addVideoToPlaylist(playlistId, videoId);
  }
  
  revalidatePath('/saved');
  return { success: true, isIn: !isIn };
}

export async function getPlaylistVideosAction(playlistId: number) {
  const { videoModel } = await import("./models/video");
  return await videoModel.getVideosByPlaylist(playlistId);
}

export async function getWatchHistoryAction() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  const { videoModel } = await import("./models/video");
  return await videoModel.getWatchHistory(Number(session.user.id));
}


