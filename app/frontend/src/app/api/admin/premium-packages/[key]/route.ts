import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params;
        const body = await request.json();

        const res = await fetch(`http://127.0.0.1:5000/api/admin/premium-packages/${key}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params;
        const res = await fetch(`http://127.0.0.1:5000/api/admin/premium-packages/${key}`, {
            method: 'DELETE',
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
