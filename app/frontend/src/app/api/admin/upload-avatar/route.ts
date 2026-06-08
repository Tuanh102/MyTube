export const dynamic = 'force-dynamic';

import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const res = await fetch('http://127.0.0.1:5000/api/admin/upload-avatar', {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
