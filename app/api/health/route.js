// In app/api/health/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
