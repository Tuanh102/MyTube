import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { fingerprint, title, description, channelId } = body;

        const res = await fetch(`http://127.0.0.1:5000/videos/check-copyright`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fingerprint,
                title,
                description,
                channelId
            })
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed copyright validation check" }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Video copyright check error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
