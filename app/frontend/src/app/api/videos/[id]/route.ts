import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const formData = await req.formData();
        const title = formData.get('title');
        const description = formData.get('description');
        const categoryId = formData.get('categoryId');
        const thumbnailFile = formData.get('thumbnail') as File | null;

        const updateData: any = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (categoryId) {
            updateData.category_id = categoryId;
        }

        const isFree = formData.get('is_free');
        const price = formData.get('price');
        if (isFree !== null) updateData.is_free = isFree === 'true';
        if (price !== null) updateData.price = Number(price);

        if (thumbnailFile && thumbnailFile.size > 0) {
            const bytes = await thumbnailFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const filename = `${Date.now()}-${thumbnailFile.name}`;
            const uploadDir = path.join(process.cwd(), '..', 'backend', 'uploads');
            await mkdir(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);
            updateData.thumbnail_url = `/uploads/${filename}`;
        }

        const res = await fetch(`http://127.0.0.1:5000/videos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to update video" }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Video update error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        // 1. Fetch video details from DB first to get public_ids
        const videoRes = await fetch(`http://127.0.0.1:5000/videos/${id}?userId=${user.id}`);
        const videoData = await videoRes.json();
        
        if (!videoRes.ok || !videoData.video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        const { video_public_id, thumbnail_public_id } = videoData.video;

        // 2. Delete from Cloudinary if public_ids exist
        if (video_public_id) {
            await cloudinary.uploader.destroy(video_public_id, { resource_type: 'video' });
        }
        if (thumbnail_public_id) {
            await cloudinary.uploader.destroy(thumbnail_public_id);
        }

        // 3. Delete from DB
        const res = await fetch(`http://127.0.0.1:5000/videos/${id}`, {
            method: 'DELETE',
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to delete video from DB" }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Video deletion error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
