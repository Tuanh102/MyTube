import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slotId: string }> }
) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slotId } = await params;
    try {
        const body = await req.json();
        // Inject current user ID for safety
        const requestBody = {
            ...body,
            userId: user.id
        };

        const res = await fetch(`http://127.0.0.1:5000/api/ads/${slotId}/pay`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!res.ok) {
            const errData = await res.json();
            return NextResponse.json({ error: errData.message || "Failed to process payment" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error(`Error processing payment for ad ${slotId} in proxy:`, err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
