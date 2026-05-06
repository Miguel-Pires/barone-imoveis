import { NextRequest, NextResponse } from 'next/server'
import { getImoveis, createImovel } from '@/lib/db'
import { checkAdminAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const soAtivos = searchParams.get('todos') !== '1'
  return NextResponse.json(getImoveis(soAtivos))
}

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const imovel = createImovel(body)
    return NextResponse.json(imovel, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }
}
