import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getImovelById, updateImovel, deleteImovel } from '@/lib/db'
import { checkAdminAuth } from '@/lib/auth'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const imovel = await getImovelById(id)
  if (!imovel) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(imovel)
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const { id } = await params
  try {
    const body = await req.json()
    const updated = await updateImovel(id, body)
    if (!updated) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    revalidatePath('/', 'layout')

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const { id } = await params

  const imovel = await getImovelById(id)
  const ok = await deleteImovel(id)
  if (!ok) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  revalidatePath('/', 'layout')

  return NextResponse.json({ success: true })
}
