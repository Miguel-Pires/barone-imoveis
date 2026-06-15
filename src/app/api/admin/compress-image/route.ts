import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase'
import sharp from 'sharp'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const URL_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { url } = await req.json()

  if (typeof url !== 'string' || !url.startsWith(URL_PREFIX)) {
    return NextResponse.json({ success: false, reason: 'skip', message: 'URL não é do storage' })
  }

  const storagePath = decodeURIComponent(url.slice(URL_PREFIX.length).split('?')[0])

  const { data, error: downloadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .download(storagePath)

  if (downloadError || !data) {
    return NextResponse.json({ success: false, reason: 'error', message: downloadError?.message ?? 'Download falhou' })
  }

  const originalBuffer = Buffer.from(await data.arrayBuffer())
  const originalSize = originalBuffer.length

  let compressedBuffer: Buffer
  try {
    compressedBuffer = await sharp(originalBuffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer()
  } catch {
    return NextResponse.json({ success: false, reason: 'skip', message: 'Não é imagem' })
  }

  if (compressedBuffer.length >= originalSize * 0.95) {
    return NextResponse.json({ success: false, reason: 'skip', message: 'Já otimizada' })
  }

  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, compressedBuffer, { upsert: true, contentType: 'image/jpeg' })

  if (uploadError) {
    return NextResponse.json({ success: false, reason: 'error', message: uploadError.message })
  }

  return NextResponse.json({
    success: true,
    originalSize,
    newSize: compressedBuffer.length,
    saved: originalSize - compressedBuffer.length,
  })
}
