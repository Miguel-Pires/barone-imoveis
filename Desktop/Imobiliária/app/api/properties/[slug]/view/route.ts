import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.rpc('increment_views', { prop_slug: params.slug })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao registrar visualizacao' }, { status: 500 })
  }
}
