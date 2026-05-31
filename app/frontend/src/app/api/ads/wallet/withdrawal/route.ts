import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        // Make sure user requests withdrawal for their own ID
        if (body.userId !== user.id) {
            return NextResponse.json({ error: "Unauthorized operation" }, { status: 403 });
        }

        const res = await fetch("http://127.0.0.1:5000/api/ads/wallet/withdrawal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errData = await res.json();
            return NextResponse.json({ error: errData.message || "Failed to process withdrawal" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Error requesting withdrawal in proxy:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
