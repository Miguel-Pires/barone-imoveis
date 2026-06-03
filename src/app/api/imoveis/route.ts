import { NextRequest, NextResponse } from 'next/server'
import { getImoveis, createImovel } from '@/lib/db'
import { checkAdminAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const soAtivos = searchParams.get('todos') !== '1'
  return NextResponse.json(await getImoveis(soAtivos))
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const imovel = await createImovel(body)
    return NextResponse.json(imovel, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    console.error('[POST /api/imoveis]', msg)
    return NextResponse.json({ error: 'Dados inválidos', detail: msg }, { status: 400 })
  }
}
