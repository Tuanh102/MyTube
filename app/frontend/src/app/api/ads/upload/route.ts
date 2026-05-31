import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    // Basic auth check
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const staffRole = req.headers.get("x-staff-role");
    if (!user?.id && staffRole !== "STAFF" && staffRole !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i.test(file.name);

        if (isVideo) {
            // Upload video to Cloudinary
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            const uploadResult = await new Promise<any>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'video', folder: 'ads' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.write(buffer);
                stream.end();
            });
            
            return NextResponse.json({ success: true, url: uploadResult.secure_url });
        } else {
            // Upload image to backend/uploads/ads
            let uploadDir = path.join(process.cwd(), "..", "backend", "uploads", "ads");
            if (!fs.existsSync(path.join(process.cwd(), "..", "backend"))) {
                uploadDir = path.join(process.cwd(), "..", "server", "uploads", "ads");
            }

            await mkdir(uploadDir, { recursive: true });

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Sanitize and create filename
            const filename = `${Date.now()}-ad-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
            const filePath = path.join(uploadDir, filename);
            
            await writeFile(filePath, buffer);
            
            const mediaUrl = `/uploads/ads/${filename}`;
            return NextResponse.json({ success: true, url: mediaUrl });
        }
    } catch (err: any) {
        console.error("Ad media upload error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
