import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, phone, password } = body;

        // Gọi sang Server NestJS (Localhost:5000)
        const res = await fetch(`http://localhost:5000/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, phone, password })
        });

        const data = await res.json();
        
        if (data.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: data.message || "Đăng ký thất bại" }, { status: 400 });
        }
    } catch (err: any) {
        console.error("Register API error:", err);
        return NextResponse.json({ success: false, message: "Lỗi kết nối server" }, { status: 500 });
    }
}
