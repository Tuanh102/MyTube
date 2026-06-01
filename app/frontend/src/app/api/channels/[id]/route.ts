import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const avatarFile = formData.get('avatar') as File | null;
        const bannerFile = formData.get('banner') as File | null;

        const updateData: any = {};
        if (name) updateData.channel_name = name;
        if (description) updateData.description = description;

        const uploadDir = path.join(process.cwd(), '..', 'server', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        if (avatarFile && avatarFile.size > 0) {
            const bytes = await avatarFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-avatar-${avatarFile.name}`;
            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);
            updateData.avatar_url = `/uploads/${filename}`;
        }

        if (bannerFile && bannerFile.size > 0) {
            const bytes = await bannerFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-banner-${bannerFile.name}`;
            const filePath = path.join(uploadDir, filename);
            await writeFile(filePath, buffer);
            updateData.banner_url = `/uploads/${filename}`;
        }

        const res = await fetch(`http://127.0.0.1:5000/channels/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to update channel" }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Channel update error:", err);
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
        const res = await fetch(`http://127.0.0.1:5000/channels/${id}`, {
            method: 'DELETE',
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to delete channel" }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Channel deletion error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
