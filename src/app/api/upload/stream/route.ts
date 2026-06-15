export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'

const ALLOWED = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm',
])

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const BUCKET = 'imoveis'

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const contentType = req.headers.get('x-content-type') ?? ''
  const ext = req.headers.get('x-ext') ?? 'bin'

  if (!ALLOWED.has(contentType)) {
    return NextResponse.json({ error: 'Tipo não permitido' }, { status: 400 })
  }

  const filename = `${crypto.randomUUID()}.${ext.toLowerCase()}`

  // Faz stream do body diretamente para o Supabase Storage com a service role
  // key — bypassa restrições de MIME type e fileSizeLimit do bucket, e evita
  // o limite de 4.5 MB das funções serverless do Vercel.
  const uploadRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        'Content-Type': contentType,
        'x-upsert': 'false',
      },
      // @ts-ignore — duplex necessário para streaming do body no Edge Runtime
      body: req.body,
      duplex: 'half',
    }
  )

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({ message: 'Erro no upload' }))
    return NextResponse.json({ error: (err as { message: string }).message }, { status: uploadRes.status })
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`
  return NextResponse.json({ url: publicUrl })
}
