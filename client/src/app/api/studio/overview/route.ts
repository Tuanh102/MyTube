import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');

    try {
        const res = await fetch(`http://127.0.0.1:5000/videos/studio/overview?userId=${user.id}&channelId=${channelId || 'all'}`);
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Studio overview error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
