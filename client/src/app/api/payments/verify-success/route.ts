import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { userId, videoId, orderId } = body;

        // Gọi sang Server NestJS (127.0.0.1:5000)
        const res = await fetch(`http://127.0.0.1:5000/payments/verify-success`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, videoId, orderId })
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to verify payment" }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Payment verify error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
