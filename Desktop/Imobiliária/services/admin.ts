import { createAdminClient } from '@/lib/supabase/admin'
import { PropertyInput } from '@/lib/schemas'

export async function getAllProperties() {
  if (!hasAdminSupabaseEnv()) return []

  const supabase = createAdminClient()
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('id, slug, title, city, price, is_launch, created_at')
      .order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export async function getPropertyById(id: string) {
  if (!hasAdminSupabaseEnv()) return null

  const supabase = createAdminClient()
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(
        `*, property_images(*), property_floorplans(*), property_features(*), property_amenities(*)`
      )
      .eq('id', id)
      .single()
    if (error) return null
    return data
  } catch {
    return null
  }
}

export async function createProperty(input: PropertyInput): Promise<string> {
  assertAdminSupabaseEnv()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('properties')
    .insert(input)
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  return data.id
}

export async function updateProperty(id: string, input: Partial<PropertyInput>) {
  assertAdminSupabaseEnv()
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('properties')
    .update(input)
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteProperty(id: string) {
  assertAdminSupabaseEnv()
  const supabase = createAdminClient()
  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function upsertFeatures(propertyId: string, names: string[]) {
  assertAdminSupabaseEnv()
  const supabase = createAdminClient()
  await supabase.from('property_features').delete().eq('property_id', propertyId)
  if (names.length === 0) return
  await supabase
    .from('property_features')
    .insert(names.map((name) => ({ property_id: propertyId, name })))
}

export async function upsertAmenities(propertyId: string, names: string[]) {
  assertAdminSupabaseEnv()
  const supabase = createAdminClient()
  await supabase.from('property_amenities').delete().eq('property_id', propertyId)
  if (names.length === 0) return
  await supabase
    .from('property_amenities')
    .insert(names.map((name) => ({ property_id: propertyId, name })))
}

export async function getDashboardStats() {
  if (!hasAdminSupabaseEnv()) {
    return { propertyCount: 0, recentLeads: [] }
  }

  const supabase = createAdminClient()
  try {
    const [{ count: propCount }, { data: recentLeads }] = await Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase
        .from('leads')
        .select('id, name, phone, interest, created_at, property_id')
        .order('created_at', { ascending: false })
        .limit(10),
    ])
    return { propertyCount: propCount ?? 0, recentLeads: recentLeads ?? [] }
  } catch {
    return { propertyCount: 0, recentLeads: [] }
  }
}

function hasAdminSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function assertAdminSupabaseEnv() {
  if (!hasAdminSupabaseEnv()) {
    throw new Error('Missing Supabase admin environment variables')
  }
}
