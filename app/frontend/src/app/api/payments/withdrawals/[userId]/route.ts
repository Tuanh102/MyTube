import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;
    try {
        const res = await fetch(`http://127.0.0.1:5000/payments/withdrawals/user/${userId}`, {
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, {
            status: res.status,
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate'
            }
        });
    } catch (err: any) {
        console.error('[API WITHDRAW LIST PROXY ERROR]:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
