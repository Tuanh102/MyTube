import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch('http://localhost:5000/api/admin/transactions', {
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
