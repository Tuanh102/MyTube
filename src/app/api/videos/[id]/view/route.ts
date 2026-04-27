import { NextResponse } from 'next/server';
import { videoModel } from '@/lib/models/video';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const videoId = parseInt(id);

  if (isNaN(videoId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status:400 });
  }

  try {
    await videoModel.incrementViewCount(videoId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('View count error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
