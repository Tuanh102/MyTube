import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    // Chúng ta có thể kiểm tra session admin ở đây nếu cần bảo mật hơn
    try {
        const res = await fetch('http://localhost:5000/api/admin/stats', {
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
