import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const pathStr = params.path.join('/');
  const searchParams = req.nextUrl.searchParams.toString();
  
  let targetPath = pathStr;
  if (pathStr.startsWith('admin/') || pathStr.startsWith('support/')) {
    targetPath = `api/${pathStr}`;
  }
  
  const backendUrl = `http://127.0.0.1:5000/${targetPath}${searchParams ? '?' + searchParams : ''}`;
  
  try {
    const res = await fetch(backendUrl, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const pathStr = params.path.join('/');
  let targetPath = pathStr;
  if (pathStr.startsWith('admin/') || pathStr.startsWith('support/')) {
    targetPath = `api/${pathStr}`;
  }
  
  const backendUrl = `http://127.0.0.1:5000/${targetPath}`;
  const body = await req.json().catch(() => ({}));
  
  try {
    const res = await fetch(backendUrl, {
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

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const pathStr = params.path.join('/');
  let targetPath = pathStr;
  if (pathStr.startsWith('admin/') || pathStr.startsWith('support/')) {
    targetPath = `api/${pathStr}`;
  }
  
  const backendUrl = `http://127.0.0.1:5000/${targetPath}`;
  
  try {
    const res = await fetch(backendUrl, { method: 'DELETE' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const pathStr = params.path.join('/');
  let targetPath = pathStr;
  if (pathStr.startsWith('admin/') || pathStr.startsWith('support/')) {
    targetPath = `api/${pathStr}`;
  }
  
  const backendUrl = `http://127.0.0.1:5000/${targetPath}`;
  const body = await req.json().catch(() => ({}));
  
  try {
    const res = await fetch(backendUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
