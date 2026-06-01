export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    try {
        const res = await fetch(`http://127.0.0.1:5000/users/purchased?userId=${userId}`, {
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate'
            }
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
