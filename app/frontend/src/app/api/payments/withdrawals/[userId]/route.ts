import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    { params }: { params: { userId: string } }
) {
    const { userId } = params;
    try {
        const res = await fetch(`http://127.0.0.1:5000/payments/withdrawals/user/${userId}`, {
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        console.error('[API WITHDRAW LIST PROXY ERROR]:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
