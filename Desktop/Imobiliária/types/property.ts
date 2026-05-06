export interface PropertyImage {
  id: string
  property_id: string
  url: string
  order: number
}

export interface PropertyFloorplan {
  id: string
  property_id: string
  url: string
  label: string
}

export interface PropertyFeature {
  id: string
  property_id: string
  name: string
}

export interface PropertyAmenity {
  id: string
  property_id: string
  name: string
}

export interface PropertyStatus {
  id: string
  property_id: string
  stage: string
  date: string
}

export interface Property {
  id: string
  slug: string
  title: string
  description: string
  neighborhood: string
  city: string
  state: string
  price: number | null
  bedrooms_min: number
  bedrooms_max: number
  bathrooms: number
  area_min: number
  area_max: number
  parking: number
  latitude: number | null
  longitude: number | null
  is_launch: boolean
  urgency_text: string | null
  views_count: number
  created_at: string
  property_images?: PropertyImage[]
  property_floorplans?: PropertyFloorplan[]
  property_features?: PropertyFeature[]
  property_amenities?: PropertyAmenity[]
  property_status?: PropertyStatus[]
}

export interface Lead {
  id?: string
  property_id: string
  name?: string
  phone: string
  interest: string
  created_at?: string
}
