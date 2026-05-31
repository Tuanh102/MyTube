import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const res = await fetch("http://127.0.0.1:5000/api/ads/settings", { cache: "no-store" });
        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch ads settings" }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Error fetching ads settings in route:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
