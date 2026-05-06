import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_BUCKETS = new Set(['property-images', 'property-floorplans'])

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const bucket = String(formData.get('bucket') ?? '')
  const propertyId = String(formData.get('propertyId') ?? 'draft')
  const files = formData.getAll('files').filter((file): file is File => file instanceof File)

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: 'Bucket invalido' }, { status: 400 })
  }

  if (files.length === 0) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const urls: string[] = []

  for (const file of files) {
    const extension = file.name.split('.').pop() ?? 'jpg'
    const path = `${propertyId}/${Date.now()}-${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return NextResponse.json({ urls })
}
