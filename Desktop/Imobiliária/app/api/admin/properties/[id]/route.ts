import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { propertySchema } from '@/lib/schemas'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteProperty, updateProperty } from '@/services/admin'

interface RouteContext {
  params: { id: string }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const body = await req.json()
  const parsed = propertySchema.safeParse(body.property)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const features = normalizeNames(body.features)
  const amenities = normalizeNames(body.amenities)
  const images = normalizeUrls(body.images)
  const floorplans = normalizeUrls(body.floorplans)

  try {
    await updateProperty(params.id, parsed.data)
    await replaceRelations(params.id, features, amenities, images, floorplans)
    revalidatePath('/')
    revalidatePath(`/imovel/${parsed.data.slug}`)
    revalidatePath('/imoveis')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao salvar imovel' },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await deleteProperty(params.id)
    revalidatePath('/')
    revalidatePath('/imoveis')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao excluir imovel' },
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

  await Promise.all([
    supabase.from('property_features').delete().eq('property_id', propertyId),
    supabase.from('property_amenities').delete().eq('property_id', propertyId),
    supabase.from('property_images').delete().eq('property_id', propertyId),
    supabase.from('property_floorplans').delete().eq('property_id', propertyId),
  ])

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
