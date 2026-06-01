export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch(`http://127.0.0.1:5000/payments/premium-packages`, {
            cache: 'no-store'
        });
        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Failed to fetch premium packages" }, { status: res.status });
        }
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Premium packages proxy fetch error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
