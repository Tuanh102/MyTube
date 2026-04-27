import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { videoModel } from '@/lib/models/video';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId') ? Number(searchParams.get('channelId')) : undefined;
    const search = searchParams.get('search') || undefined;
    
    const videos = await videoModel.getVideosByUserId(Number(session.user.id), channelId, search);
    return NextResponse.json(videos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
