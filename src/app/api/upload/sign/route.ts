import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_IMAGES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_VIDEOS = ['video/mp4', 'video/quicktime', 'video/webm']
const ALLOWED = [...ALLOWED_IMAGES, ...ALLOWED_VIDEOS]

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { contentType, ext } = await req.json()

    if (!ALLOWED.includes(contentType)) {
      return NextResponse.json({ error: 'Tipo não permitido' }, { status: 400 })
    }

    const filename = `${uuidv4()}.${(ext as string)?.toLowerCase() ?? 'jpg'}`

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(filename)

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? 'Erro ao gerar URL' }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(filename)

    return NextResponse.json({
      token: data.token,
      path: data.path,
      publicUrl: urlData.publicUrl,
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 })
  }
}
