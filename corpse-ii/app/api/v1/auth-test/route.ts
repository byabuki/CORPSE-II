import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== process.env.API_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized 🔒' }, { status: 401 });
  }

  return NextResponse.json({ message: 'Verified 🔓' }, { status: 200 });
}
