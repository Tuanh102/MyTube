import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slotId: string }> }
) {
    const { slotId } = await params;
    try {
        const body = await req.json();
        const res = await fetch(`http://127.0.0.1:5000/api/ads/${slotId}/track`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            return NextResponse.json({ error: `Failed to track ad ${slotId}` }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error(`Error tracking ad ${slotId} in proxy:`, err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
