import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slotId: string }> }
) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const staffRole = req.headers.get("x-staff-role");

    if (!user?.id && staffRole !== "STAFF" && staffRole !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slotId } = await params;
    try {
        const body = await req.json();
        const res = await fetch(`http://127.0.0.1:5000/api/ads/${slotId}/verify-content`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            return NextResponse.json({ error: `Failed to verify content for ${slotId}` }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error(`Error verifying content for ${slotId} in proxy:`, err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
