import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const res = await fetch('http://127.0.0.1:5000/api/admin/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ message: data.message || 'Mã OTP không chính xác hoặc đã hết hạn' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Verify OTP Proxy Error:', error);
        return NextResponse.json({ message: 'Không thể kết nối tới Server: ' + error.message }, { status: 500 });
    }
}
