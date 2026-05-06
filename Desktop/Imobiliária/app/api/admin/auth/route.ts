import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { secret } = await req.json()
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret || !secret || secret !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_secret', secret, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}
