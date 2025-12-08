import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { nombre, email, password } = body;
  
  const params = new URLSearchParams();
  params.append('nombre', nombre);
  params.append('email', email);
  params.append('password', password);
  const res = await fetch('http://localhost:8000/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  const data = await res.json();
  if (!res.ok) {
    let errorDetail = typeof data === "string" ? data : data.detail || "Error al registrarse";
    return NextResponse.json({ detail: errorDetail }, { status: res.status });
  }
  return NextResponse.json(data);
}
