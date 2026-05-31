import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/options";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const staffRole = req.headers.get("x-staff-role");
    const { userId } = await params;

    // Check if the user is fetching their own wallet, or is staff/admin
    if (user?.id !== userId && staffRole !== "STAFF" && staffRole !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const res = await fetch(`http://127.0.0.1:5000/api/ads/wallet/balance/${userId}`, { cache: "no-store" });
        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch wallet balance" }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error(`Error fetching wallet balance for ${userId} in proxy:`, err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
