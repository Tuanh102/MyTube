import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { videoModel } from '@/lib/models/video';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const videoId = parseInt(id);

  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const thumbnailFile = formData.get('thumbnail') as File;

    const currentVideo = await videoModel.getVideoById(videoId);
    if (!currentVideo) {
      return NextResponse.json({ error: 'Video không tồn tại' }, { status: 404 });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== null) updateData.description = description;
    if (categoryId) updateData.category_id = parseInt(categoryId);

    // Handle thumbnail update
    if (thumbnailFile && typeof thumbnailFile !== 'string') {
      const thumbnailFileName = `${Date.now()}-${thumbnailFile.name.replace(/\s+/g, '-')}`;
      const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const thumbnailPath = path.join(process.cwd(), 'public', 'uploads', thumbnailFileName);
      await writeFile(thumbnailPath, thumbnailBuffer);
      updateData.thumbnail_url = thumbnailFileName;

      // Delete old thumbnail if it exists
      if (currentVideo.thumbnail_url) {
        try {
          await unlink(path.join(process.cwd(), 'public', 'uploads', currentVideo.thumbnail_url));
        } catch (e) {
          console.error('Không thể xóa ảnh cũ:', e);
        }
      }
    }

    await videoModel.updateVideo(videoId, updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const videoId = parseInt(id);

  try {
    const video = await videoModel.getVideoById(videoId);
    if (!video) {
      return NextResponse.json({ error: 'Video không tồn tại' }, { status: 404 });
    }

    // Delete files
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (video.video_url) {
      try {
        await unlink(path.join(uploadsDir, video.video_url));
      } catch (e) {
        console.error('Lỗi khi xóa file video:', e);
      }
    }

    if (video.thumbnail_url) {
      try {
        await unlink(path.join(uploadsDir, video.thumbnail_url));
      } catch (e) {
        console.error('Lỗi khi xóa file thumbnail:', e);
      }
    }

    await videoModel.deleteVideo(videoId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
