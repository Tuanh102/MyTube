export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

function getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.gif': return 'image/gif';
        case '.svg': return 'image/svg+xml';
        case '.webp': return 'image/webp';
        case '.avif': return 'image/avif';
        default: return 'application/octet-stream';
    }
}

export async function GET(
    request: Request,
    { params }: { params: { path: string[] } }
) {
    try {
        const filePathSegment = params.path.join('/');
        const targetDir = path.join(process.cwd(), 'src', 'assets', 'img');
        const resolvedPath = path.join(targetDir, filePathSegment);
        
        // Bảo vệ an toàn chống Directory Traversal
        if (!resolvedPath.startsWith(targetDir)) {
            return new NextResponse('Access Denied', { status: 403 });
        }

        const fileBuffer = await fs.readFile(resolvedPath);
        const contentType = getContentType(resolvedPath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        return new NextResponse('Not Found', { status: 404 });
    }
}
