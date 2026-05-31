import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
        return NextResponse.json({ error: `Unauthorized - Không tìm thấy phiên đăng nhập hợp lệ (Session: ${!!session}, HasID: ${!!(session?.user as any)?.id})` }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { amount, description, userId, videoId } = body;

        // Gọi sang Server NestJS (127.0.0.1:5000)
        const res = await fetch(`http://127.0.0.1:5000/payments/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, description, userId, videoId })
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to create payment link" }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Payment create error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
