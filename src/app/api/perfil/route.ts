import { NextResponse } from 'next/server'
import { getCorretor, updateCorretor } from '@/lib/db'
import { checkAdminAuth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET() {
  const corretor = await getCorretor()
  return NextResponse.json(corretor)
}

export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json()
  await updateCorretor(body)
  return NextResponse.json({ ok: true })
}
