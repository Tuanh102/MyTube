export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const staffRole = req.headers.get("x-staff-role");

    if (!user?.id && staffRole !== "STAFF" && staffRole !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const res = await fetch("http://127.0.0.1:5000/api/ads/revenue", { cache: "no-store" });
        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Error fetching ad revenue in frontend proxy:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
