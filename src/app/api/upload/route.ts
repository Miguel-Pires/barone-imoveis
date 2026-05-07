import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const ALLOWED_IMAGES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_VIDEOS = ['video/mp4', 'video/quicktime', 'video/webm']
const ALLOWED = [...ALLOWED_IMAGES, ...ALLOWED_VIDEOS]
const MAX_SIZE_IMAGE = 10 * 1024 * 1024
const MAX_SIZE_VIDEO = 200 * 1024 * 1024

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Tipo não permitido' }, { status: 400 })
    const isVideo = ALLOWED_VIDEOS.includes(file.type)
    const maxSize = isVideo ? MAX_SIZE_VIDEO : MAX_SIZE_IMAGE
    if (file.size > maxSize) return NextResponse.json({ error: `Arquivo muito grande (máx ${isVideo ? '200MB' : '10MB'})` }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `${uuidv4()}.${ext}`
    const bytes = await file.arrayBuffer()

    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filename, bytes, { contentType: file.type, upsert: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(filename)
    return NextResponse.json({ url: data.publicUrl })
  } catch {
    return NextResponse.json({ error: 'Erro no upload' }, { status: 500 })
  }
}
