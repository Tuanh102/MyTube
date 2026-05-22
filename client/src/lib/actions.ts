"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export async function toggleLike(videoId: string, userId: string | number) {
    console.log(`Action: toggleLike videoId=${videoId}, userId=${userId}`);
    try {
        const res = await fetch(`${API_URL}/videos/${videoId}/like`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId.toString() })
        });
        const data = await res.json();
        console.log(`Response from API:`, data);
        return data;
    } catch (err) {
        console.error("Action error toggleLike:", err);
        return { success: false, error: String(err) };
    }
}

export async function toggleDislike(videoId: string, userId: string | number) {
    console.log(`Action: toggleDislike videoId=${videoId}, userId=${userId}`);
    try {
        const res = await fetch(`${API_URL}/videos/${videoId}/dislike`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId.toString() })
        });
        const data = await res.json();
        console.log(`Response from API:`, data);
        return data;
    } catch (err) {
        console.error("Action error toggleDislike:", err);
        return { success: false, error: String(err) };
    }
}

export async function toggleFollow(channelId: string, userId: string) { 
    console.log(`Action: toggleFollow channelId=${channelId}, userId=${userId}`);
    try {
        const res = await fetch(`${API_URL}/channels/${channelId}/follow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId.toString() })
        });
        const data = await res.json();
        console.log(`Response from API:`, data);
        return data;
    } catch (err) {
        console.error("Action error toggleFollow:", err);
        return { success: false, error: String(err) };
    }
}

export async function toggleCommentInteraction(commentId: string, userId: number | string, videoId: string, type: 'like' | 'dislike') {
    try {
        const res = await fetch(`${API_URL}/comments/${commentId}/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId.toString() })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        return { success: false, error: String(err) };
    }
}

export async function submitCommentAction(videoId: string, userId: number | string, content: string, parentCommentId?: string) {
    try {
        const res = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId, userId: userId.toString(), content, parentCommentId })
        });
        const data = await res.json();
        if (!res.ok) {
            return { success: false, error: data.message || 'Error saving comment' };
        }
        return { success: true, comment: data };
    } catch (err) {
        return { success: false, error: String(err) };
    }
}

export async function getUserPlaylistsAction(videoId?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    try {
        const res = await fetch(`${API_URL}/playlists?userId=${session.user.id}${videoId ? `&videoId=${videoId}` : ''}`, { cache: 'no-store' });
        return res.json();
    } catch (err) {
        console.error("getUserPlaylistsAction error:", err);
        return [];
    }
}

export async function createPlaylistAction(name: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    try {
        const res = await fetch(`${API_URL}/playlists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, userId: session.user.id })
        });
        if (res.ok) return { success: true };
        return { success: false };
    } catch (err) {
        return { success: false, error: String(err) };
    }
}

export async function toggleVideoInPlaylistAction(playlistId: string, videoId: string) {
    try {
        const res = await fetch(`${API_URL}/playlists/${playlistId}/toggle-video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId })
        });
        return res.json();
    } catch (err) {
        return { success: false };
    }
}

export async function getPlaylistVideosAction(playlistId: string) {
    try {
        const res = await fetch(`${API_URL}/playlists/${playlistId}/videos`, { cache: 'no-store' });
        return res.json();
    } catch (err) {
        return [];
    }
}

export async function addToHistoryAction(videoId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false };

    try {
        await fetch(`${API_URL}/users/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id, videoId })
        });
        return { success: true };
    } catch (err) {
        return { success: false };
    }
}

export async function getWatchHistoryAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    try {
        const res = await fetch(`${API_URL}/users/history?userId=${session.user.id}`, { cache: 'no-store' });
        return res.json();
    } catch (err) {
        return [];
    }
}

export async function getLikedVideosAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    try {
        const res = await fetch(`${API_URL}/videos/likes?userId=${session.user.id}`, { cache: 'no-store' });
        return res.json();
    } catch (err) {
        return [];
    }
}

export async function getPurchasedVideosAction() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    try {
        const res = await fetch(`${API_URL}/users/purchased?userId=${session.user.id}`, { cache: 'no-store' });
        return res.json();
    } catch (err) {
        return [];
    }
}


export async function incrementViewCountAction(videoId: string) {
    try {
        const res = await fetch(`${API_URL}/videos/${videoId}/view`, { method: 'POST', cache: 'no-store' });
        return res.json();
    } catch (err) {
        return { success: false };
    }
}

export async function submitVideoReportAction(videoId: string, userId: string, reason: string) {
    console.log(`Action: submitVideoReportAction videoId=${videoId}, userId=${userId}, reason=${reason}`);
    try {
        const res = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoId, userId, reason })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Action error submitVideoReportAction:", err);
        return { success: false, error: String(err) };
    }
}

export async function getUserReportsAction(userId: string) {
    console.log(`Action: getUserReportsAction userId=${userId}`);
    try {
        const res = await fetch(`${API_URL}/reports/user?userId=${userId}`, { cache: 'no-store' });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Action error getUserReportsAction:", err);
        return [];
    }
}

export async function getPendingReportsAction() {
    console.log(`Action: getPendingReportsAction`);
    try {
        const res = await fetch(`${API_URL}/reports`, { cache: 'no-store' });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Action error getPendingReportsAction:", err);
        return [];
    }
}

export async function resolveReportAction(reportId: string, action: 'DELETE_VIDEO' | 'KEEP_VIDEO') {
    console.log(`Action: resolveReportAction reportId=${reportId}, action=${action}`);
    try {
        const res = await fetch(`${API_URL}/reports/${reportId}/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Action error resolveReportAction:", err);
        return { success: false, error: String(err) };
    }
}

export async function getNotificationsAction(userId: string, filter?: string) {
    console.log(`Action: getNotificationsAction userId=${userId}, filter=${filter}`);
    try {
        const res = await fetch(`${API_URL}/notifications?userId=${userId}&filter=${filter || 'all'}`, { cache: 'no-store' });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Action error getNotificationsAction:", err);
        return [];
    }
}

export async function markNotificationsRead(userId: string) {
    console.log(`Action: markNotificationsRead userId=${userId}`);
    try {
        const res = await fetch(`${API_URL}/notifications/read-all`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Action error markNotificationsRead:", err);
        return { success: false, error: String(err) };
    }
}

export async function markSingleNotificationRead(id: string) {
    console.log(`Action: markSingleNotificationRead id=${id}`);
    try {
        const res = await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Action error markSingleNotificationRead:", err);
        return { success: false, error: String(err) };
    }
}

export async function deleteNotificationAction(id: string) {
    console.log(`Action: deleteNotificationAction id=${id}`);
    try {
        const res = await fetch(`${API_URL}/notifications/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Action error deleteNotificationAction:", err);
        return { success: false, error: String(err) };
    }
}

export async function clearAllNotificationsAction(userId: string) {
    console.log(`Action: clearAllNotificationsAction userId=${userId}`);
    try {
        const res = await fetch(`${API_URL}/notifications`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Action error clearAllNotificationsAction:", err);
        return { success: false, error: String(err) };
    }
}

export async function upgradePremiumAction(userId: string) {
    try {
        const res = await fetch(`${API_URL}/users/upgrade-premium`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("upgradePremiumAction error:", err);
        return { success: false, message: String(err) };
    }
}
