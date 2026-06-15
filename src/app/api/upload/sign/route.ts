import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const ALLOWED_IMAGES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_VIDEOS = ['video/mp4', 'video/quicktime', 'video/webm']
const ALLOWED = [...ALLOWED_IMAGES, ...ALLOWED_VIDEOS]

// Usa a REST API do Supabase Storage diretamente (não o SDK) para garantir
// que os field names em snake_case sejam enviados corretamente.
// fileSizeLimit em bytes evita ambiguidade com strings como '200MB'.
const bucketReady = fetch(`${SUPABASE_URL}/storage/v1/bucket/${STORAGE_BUCKET}`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${SERVICE_KEY}`,
    apikey: SERVICE_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: STORAGE_BUCKET,
    name: STORAGE_BUCKET,
    public: true,
    file_size_limit: 209715200, // 200 MB em bytes
    allowed_mime_types: null,
  }),
}).then(async (res) => {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error('[upload/sign] bucket PUT failed:', res.status, body)
  }
}).catch((err) => {
  console.error('[upload/sign] bucket PUT error:', err)
})

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { contentType, ext } = await req.json()

    if (!ALLOWED.includes(contentType)) {
      return NextResponse.json({ error: 'Tipo não permitido' }, { status: 400 })
    }

    await bucketReady

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
