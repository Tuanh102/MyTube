import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const title = formData.get('title');
        const description = formData.get('description');
        const channelId = formData.get('channelId');
        const videoUrl = formData.get('videoUrl');
        const videoPublicId = formData.get('videoPublicId');
        const thumbnailUrl = formData.get('thumbnailUrl');
        const thumbnailPublicId = formData.get('thumbnailPublicId');
        const duration = formData.get('duration');
        const categoryId = formData.get('categoryId');

        const res = await fetch(`http://localhost:5000/videos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                video_url: videoUrl,
                video_public_id: videoPublicId,
                thumbnail_url: thumbnailUrl,
                thumbnail_public_id: thumbnailPublicId,
                channel: channelId,
                duration: Number(duration),
                category_id: categoryId,
                is_short: Number(duration) <= 90,
                price: Number(formData.get('price')),
                is_free: formData.get('is_free') === 'true'
            })
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to save video metadata" }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Video metadata save error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
