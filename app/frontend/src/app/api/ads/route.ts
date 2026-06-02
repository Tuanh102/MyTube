export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("mode");
        const advertiserId = searchParams.get("advertiserId");
        
        let url = "http://127.0.0.1:5000/api/ads";
        const queryParams = [];
        if (mode) queryParams.push(`mode=${mode}`);
        if (advertiserId) queryParams.push(`advertiserId=${advertiserId}`);
        if (queryParams.length > 0) {
            url += `?${queryParams.join("&")}`;
        }

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch ads from backend" }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Error fetching ads in frontend API:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const staffRole = req.headers.get("x-staff-role");

    if (!user?.id && staffRole !== "STAFF" && staffRole !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        console.log("Next.js POST /api/ads payload body:", body);
        const url = (body.globalAdEnabled !== undefined)
            ? "http://127.0.0.1:5000/api/ads/settings"
            : "http://127.0.0.1:5000/api/ads";

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            let errorMsg = "Failed to perform POST action in backend";
            try {
                const errJson = await res.json();
                errorMsg = errJson.message || errJson.error || errorMsg;
            } catch (e) {}
            return NextResponse.json({ error: errorMsg }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Error performing POST ad in frontend API:", err);
        return NextResponse.json({ error: `Internal Server Error: ${err.message || err}` }, { status: 500 });
    }
}
