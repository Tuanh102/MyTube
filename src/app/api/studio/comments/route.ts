import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { commentModel } from '@/lib/models/comment';
import db from '@/lib/db';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const search = searchParams.get('search');
    const unrepliedOnly = searchParams.get('unreplied') === 'true';

    const comments = await commentModel.getCreatorComments(Number(session.user.id), {
      channelId: channelId ? Number(channelId) : undefined,
      search: search || undefined,
      unrepliedOnly
    });
    
    const serializedComments = comments.map(c => ({
      ...c,
      created_at: c.created_at.toString()
    }));

    return NextResponse.json(serializedComments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const commentId = Number(searchParams.get('id'));

    if (!commentId) {
      return NextResponse.json({ error: 'Thiếu ID bình luận' }, { status: 400 });
    }

    const success = await commentModel.deleteComment(commentId, Number(session.user.id));
    
    if (!success) {
      return NextResponse.json({ error: 'Không thể xóa bình luận hoặc bạn không có quyền' }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { videoId, content, parentCommentId, channelId } = await request.json();

    if (!videoId || !content || !channelId) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    // Double check that the user owns this channel
    const [channels] = await db.query<any[]>('SELECT channel_id FROM channels WHERE channel_id = ? AND user_id = ?', [channelId, session.user.id]);
    if (channels.length === 0) {
      return NextResponse.json({ error: 'Bạn không có quyền phản hồi bằng kênh này' }, { status: 403 });
    }

    const newCommentId = await commentModel.createComment({
      video_id: videoId,
      user_id: Number(session.user.id),
      content,
      parent_comment_id: parentCommentId,
      channel_id: channelId
    });

    return NextResponse.json({ success: true, commentId: newCommentId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
