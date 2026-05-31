import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/admin/videos', {
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
        }

        const res = await fetch(`http://127.0.0.1:5000/api/admin/videos/${id}`, {
            method: 'DELETE',
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
