import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    try {
        const res = await fetch(`http://127.0.0.1:5000/users/profile/${id}`, {
            cache: 'no-store'
        });
        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
