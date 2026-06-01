export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const resolvedParams = await params;
    const subpath = resolvedParams.path.join('/');
    const { search } = new URL(request.url);
    const targetUrl = `http://127.0.0.1:5000/live/${subpath}${search}`;

    try {
        const res = await fetch(targetUrl, {
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const resolvedParams = await params;
    const subpath = resolvedParams.path.join('/');
    const targetUrl = `http://127.0.0.1:5000/live/${subpath}`;

    try {
        const body = await request.json().catch(() => ({}));
        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
