import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { videoModel } from '@/lib/models/video';
import { channelModel } from '@/lib/models/channel';
import { notificationModel } from '@/lib/models/notification';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const channelId = formData.get('channelId') as string;
    const categoryId = formData.get('categoryId') as string;
    
    // Accept URLs directly from client (which uploaded to Cloudinary)
    const videoUrl = formData.get('videoUrl') as string;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const duration = formData.get('duration') ? Number(formData.get('duration')) : 0;

    if (!title || !channelId || !videoUrl) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    // Insert into DB
    const newVideoId = await videoModel.createVideo({
      title,
      description: description || '',
      channel_id: Number(channelId),
      category_id: Number(categoryId) || 1,
      video_url: videoUrl, 
      thumbnail_url: thumbnailUrl || null as any,
      duration: duration,
      is_short: Number(categoryId) === 1 // Assume category 1 is Shorts based on earlier code
    });

    // Notify subscribers in background
    try {
      const subscribers = await channelModel.getChannelSubscribers(Number(channelId));
      for (const sub of subscribers) {
        if (sub.user_id !== Number(session.user.id)) {
          await notificationModel.createNotification({
            user_id: sub.user_id,
            actor_id: Number(session.user.id),
            type: 'new_video',
            target_id: newVideoId
          });
        }
      }
    } catch (notificationErr) {
      console.error('Lỗi khi gửi thông báo video mới:', notificationErr);
    }

    return NextResponse.json({ success: true, videoId: newVideoId, videoUrl });
  } catch (error: any) {
    console.error('Save video error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


