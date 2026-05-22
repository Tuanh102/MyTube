import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Proxy đang gọi sang NestJS tại http://127.0.0.1:5000/admin/google-login');
        
        // Thử gọi qua localhost thay vì 127.0.0.1
        const res = await fetch('http://127.0.0.1:5000/api/admin/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ message: data.message || 'Lỗi đăng nhập Admin' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        return NextResponse.json({ message: 'Proxy không thể kết nối tới NestJS: ' + error.message }, { status: 500 });
    }
}
