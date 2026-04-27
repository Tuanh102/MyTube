import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { channelModel } from '@/lib/models/channel';

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

  try {
    const { id } = await params;
    const channelId = Number(id);
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const avatarFile = formData.get('avatar') as File;

    if (!name) {
      return NextResponse.json({ error: 'Tên kênh là bắt buộc' }, { status: 400 });
    }

    // Verify ownership
    const channels = await channelModel.getUserChannels(Number(session.user.id));
    const currentChannel = channels.find(ch => ch.channel_id === channelId);

    if (!currentChannel) {
      return NextResponse.json({ error: 'Bạn không có quyền chỉnh sửa kênh này' }, { status: 403 });
    }

    let avatarUrl = currentChannel.avatar_url;

    if (avatarFile && typeof avatarFile !== 'string') {
      const fileName = `${Date.now()}-${avatarFile.name.replace(/\s+/g, '-')}`;
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
      await writeFile(filePath, buffer);
      avatarUrl = `/uploads/${fileName}`;

      // Delete old avatar if it's not a default one
      if (currentChannel.avatar_url && currentChannel.avatar_url.includes('/uploads/')) {
        try {
          await unlink(path.join(process.cwd(), 'public', currentChannel.avatar_url));
        } catch (e) {
          console.error('Không thể xóa ảnh cũ:', e);
        }
      }
    }

    await channelModel.updateChannel(channelId, name, description, avatarUrl);
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

  try {
    const { id } = await params;
    const channelId = Number(id);

    // Verify ownership
    const channels = await channelModel.getUserChannels(Number(session.user.id));
    const ownsChannel = channels.some(ch => ch.channel_id === channelId);

    if (!ownsChannel) {
      return NextResponse.json({ error: 'Bạn không có quyền xóa kênh này' }, { status: 403 });
    }

    await channelModel.deleteChannel(channelId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
