import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Missing withdrawal ID' }, { status: 400 });
        }

        const res = await fetch(`http://127.0.0.1:5000/api/admin/withdrawals/${id}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            const errorText = await res.text();
            return NextResponse.json({ error: errorText || 'Failed to fetch withdrawal' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        console.error('[API ADMIN GET WITHDRAWAL BY ID ERROR]:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
