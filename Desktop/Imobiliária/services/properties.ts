import { createPublicClient } from '@/lib/supabase/public'
import { Property } from '@/types/property'

export interface PropertyFilters {
  city?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
}

export async function getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  if (!hasPublicSupabaseEnv()) return []

  const supabase = createPublicClient()

  let query = supabase
    .from('properties')
    .select(
      'id, slug, title, neighborhood, city, state, price, bedrooms_min, bedrooms_max, area_min, area_max, is_launch, views_count, property_images(url, "order")'
    )
    .order('created_at', { ascending: false })

  if (filters.city) query = query.ilike('city', filters.city)
  if (filters.minPrice != null) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice != null) query = query.lte('price', filters.maxPrice)
  if (filters.bedrooms != null) {
    query = query
      .lte('bedrooms_min', filters.bedrooms)
      .gte('bedrooms_max', filters.bedrooms)
  }

  try {
    const { data, error } = await query
    if (error) return []
    return (data ?? []) as unknown as Property[]
  } catch {
    return []
  }
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  if (!hasPublicSupabaseEnv()) return null

  const supabase = createPublicClient()

  try {
    const { data, error } = await supabase
      .from('properties')
      .select(
        `*, property_images(id, url, "order"), property_floorplans(id, url, label), property_features(id, name), property_amenities(id, name), property_status(id, stage, date)`
      )
      .eq('slug', slug)
      .single()

    if (error) return null
    return data as unknown as Property
  } catch {
    return null
  }
}

export async function getUniqueCities(): Promise<string[]> {
  if (!hasPublicSupabaseEnv()) return []

  const supabase = createPublicClient()

  try {
    const { data } = await supabase
      .from('properties')
      .select('city')
      .not('city', 'is', null)
    return Array.from(
      new Set((data ?? []).map((row) => row.city as string).filter(Boolean))
    )
  } catch {
    return []
  }
}

export async function getPropertySlugs(): Promise<string[]> {
  if (!hasPublicSupabaseEnv()) return []

  const supabase = createPublicClient()

  try {
    const { data } = await supabase.from('properties').select('slug')
    return (data ?? []).map((row) => String(row.slug)).filter(Boolean)
  } catch {
    return []
  }
}

function hasPublicSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
