import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const subpath = params.path.join('/');
  const searchParams = req.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_URL}/api/support/${subpath}${searchParams ? '?' + searchParams : ''}`;

  try {
    const res = await fetch(targetUrl, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const subpath = params.path.join('/');
  const targetUrl = `${BACKEND_URL}/api/support/${subpath}`;
  const body = await req.json().catch(() => ({}));

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
