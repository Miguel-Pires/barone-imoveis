import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { propertySchema } from '@/lib/schemas'
import { createProperty } from '@/services/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = propertySchema.safeParse(body.property)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  try {
    const id = await createProperty(parsed.data)
    await replaceRelations(
      id,
      normalizeNames(body.features),
      normalizeNames(body.amenities),
      normalizeUrls(body.images),
      normalizeUrls(body.floorplans)
    )
    revalidatePath('/')
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar imovel' },
      { status: 500 }
    )
  }
}

function normalizeNames(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : []
}

function normalizeUrls(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : []
}

async function replaceRelations(
  propertyId: string,
  features: string[],
  amenities: string[],
  images: string[],
  floorplans: string[]
) {
  const supabase = createAdminClient()
  const writes = []

  if (features.length > 0) {
    writes.push(
      supabase.from('property_features').insert(
        features.map((name) => ({ property_id: propertyId, name }))
      )
    )
  }
  if (amenities.length > 0) {
    writes.push(
      supabase.from('property_amenities').insert(
        amenities.map((name) => ({ property_id: propertyId, name }))
      )
    )
  }
  if (images.length > 0) {
    writes.push(
      supabase.from('property_images').insert(
        images.map((url, order) => ({ property_id: propertyId, url, order }))
      )
    )
  }
  if (floorplans.length > 0) {
    writes.push(
      supabase.from('property_floorplans').insert(
        floorplans.map((url) => ({ property_id: propertyId, url, label: 'Planta' }))
      )
    )
  }

  const results = await Promise.all(writes)
  const failed = results.find((result) => result.error)
  if (failed?.error) throw new Error(failed.error.message)
}
