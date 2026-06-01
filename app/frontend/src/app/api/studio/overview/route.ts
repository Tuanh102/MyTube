export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    console.log(`[API/STUDIO/OVERVIEW GET] Received request. Session User:`, user ? { id: user.id, name: user.name, email: user.email } : null);
    if (!user?.id) {
        console.log(`[API/STUDIO/OVERVIEW GET] Unauthorized request (no user.id).`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    try {
        const backendUrl = `http://127.0.0.1:5000/videos/studio/overview?userId=${user.id}&channelId=${channelId || 'all'}`;
        console.log(`[API/STUDIO/OVERVIEW GET] Fetching overview from backend: ${backendUrl}`);
        const res = await fetch(backendUrl, {
            cache: 'no-store'
        });
        const data = await res.json();
        console.log(`[API/STUDIO/OVERVIEW GET] Backend response overview:`, data);
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate'
            }
        });
    } catch (err: any) {
        console.error("Studio overview error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
