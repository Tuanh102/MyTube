import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { videoModel } from '@/lib/models/video';
import { channelModel } from '@/lib/models/channel';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId') ? Number(searchParams.get('channelId')) : undefined;
    
    const userId = Number(session.user.id);
    
    const [videoStats, totalSubscribers, topVideos, topChannel] = await Promise.all([
      videoModel.getUserStats(userId, channelId),
      channelModel.getUserTotalSubscribers(userId, channelId),
      videoModel.getTopVideosByUser(userId, 3, channelId),
      channelModel.getTopChannelByUser(userId)
    ]);

    return NextResponse.json({
      summary: {
        totalViews: videoStats.totalViews,
        totalVideos: videoStats.totalVideos,
        totalInteractions: videoStats.totalInteractions,
        totalSubscribers: totalSubscribers
      },
      topVideos,
      topChannel
    });
  } catch (error: any) {
    console.error('Studio overview error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
