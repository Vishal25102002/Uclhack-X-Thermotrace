// WebSocket API route handler
// This file will be implemented later

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'WebSocket not implemented yet' }, { status: 501 })
}
