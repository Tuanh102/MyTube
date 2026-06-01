export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/admin/withdrawals', {
            cache: 'no-store',
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        console.error('[API ADMIN GET WITHDRAWALS ERROR]:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { action, id, method, reason } = await req.json();

        if (!action || !id) {
            return NextResponse.json({ error: 'Missing action or id' }, { status: 400 });
        }

        let targetUrl = '';
        let bodyPayload = {};

        if (action === 'approve') {
            targetUrl = `http://127.0.0.1:5000/api/admin/withdrawals/${id}/approve`;
            bodyPayload = { method: method || 'MANUAL' };
        } else if (action === 'reject') {
            targetUrl = `http://127.0.0.1:5000/api/admin/withdrawals/${id}/reject`;
            bodyPayload = { reason: reason || 'Thông tin ngân hàng không hợp lệ' };
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyPayload),
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        console.error('[API ADMIN POST WITHDRAWALS ERROR]:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
