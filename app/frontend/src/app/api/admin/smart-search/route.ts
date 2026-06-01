export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';
        const role = searchParams.get('role') || '';
        
        const res = await fetch(`http://127.0.0.1:5000/api/admin/smart-search?q=${encodeURIComponent(query)}&role=${encodeURIComponent(role)}`, {
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
