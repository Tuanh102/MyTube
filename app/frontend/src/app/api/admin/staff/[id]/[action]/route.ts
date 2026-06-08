import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const { id, action } = await params;
  try {
    const bodyText = await req.text();
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    };
    if (bodyText) {
      fetchOptions.body = bodyText;
    }
    const res = await fetch(`http://127.0.0.1:5000/api/admin/staff/${id}/${action}`, fetchOptions);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
