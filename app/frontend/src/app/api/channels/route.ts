export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";

export async function GET() {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    console.log(`[API/CHANNELS GET] Received request. Session User:`, user ? { id: user.id, name: user.name, email: user.email } : null);
    if (!user?.id) {
        console.log(`[API/CHANNELS GET] Unauthorized request (no user.id).`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = `http://127.0.0.1:5000/channels?userId=${user.id}`;
    console.log(`[API/CHANNELS GET] Fetching channels from backend: ${backendUrl}`);
    const res = await fetch(backendUrl, {
        cache: 'no-store'
    });
    const data = await res.json();
    console.log(`[API/CHANNELS GET] Backend response data length:`, data?.length, data);
    return NextResponse.json(data, {
        headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
    });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const avatarFile = formData.get('avatar') as File | null;
        const bannerFile = formData.get('banner') as File | null;

        let avatarUrl = '/assets/img/avata.jpg'; // Default
        let bannerUrl = ''; // Default empty

        const uploadDir = path.join(process.cwd(), '..', 'server', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        if (avatarFile) {
            const bytes = await avatarFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-avatar-${avatarFile.name}`;
            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);
            avatarUrl = `/uploads/${filename}`;
        }

        if (bannerFile) {
            const bytes = await bannerFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-banner-${bannerFile.name}`;
            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);
            bannerUrl = `/uploads/${filename}`;
        }

        const res = await fetch(`http://127.0.0.1:5000/channels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                channel_name: name,
                description: description,
                avatar_url: avatarUrl,
                banner_url: bannerUrl,
                user: user.id
            })
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to create channel" }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Channel creation error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
