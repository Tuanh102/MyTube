import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const res = await fetch(`http://127.0.0.1:5000/api/admin/staff/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
