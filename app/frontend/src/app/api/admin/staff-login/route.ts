import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const res = await fetch('http://127.0.0.1:5000/api/admin/staff-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();
        if (!res.ok) {
            return NextResponse.json({ error: data.message || "Đăng nhập nhân viên thất bại" }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        console.error("Staff login error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
