import { NextRequest, NextResponse } from 'next/server'
import { leadSchema } from '@/lib/schemas'
import { insertLead } from '@/services/leads'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = leadSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  try {
    await insertLead(parsed.data)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 })
  }
}
