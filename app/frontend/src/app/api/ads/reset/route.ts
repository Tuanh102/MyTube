import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const staffRole = req.headers.get("x-staff-role");

    // Allow Admin or Staff to trigger reset during development/moderation
    if (staffRole !== "STAFF" && staffRole !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const res = await fetch("http://127.0.0.1:5000/api/ads/reset", {
            method: "POST"
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to reset ads in backend" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Error resetting ads in frontend API:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
