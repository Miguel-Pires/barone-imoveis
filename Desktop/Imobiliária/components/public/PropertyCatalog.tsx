'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PropertyCard } from '@/components/public/PropertyCard'
import { PropertyFilters } from '@/components/public/PropertyFilters'
import { Property } from '@/types/property'

interface PropertyCatalogProps {
  properties: Property[]
  cities: string[]
}

export function PropertyCatalog({ properties, cities }: PropertyCatalogProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')

  useEffect(() => {
    setCity(searchParams.get('city') ?? '')
    setBedrooms(searchParams.get('bedrooms') ?? '')
    setMaxPrice(searchParams.get('maxPrice') ?? '')
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (bedrooms) params.set('bedrooms', bedrooms)
    if (maxPrice) params.set('maxPrice', maxPrice)

    const query = params.toString()
    startTransition(() => {
      router.replace(query ? `/?${query}` : '/', { scroll: false })
    })
  }, [bedrooms, city, maxPrice, router])

  const filteredProperties = properties.filter((property) => {
    if (city && property.city !== city) return false

    if (bedrooms) {
      const bedroomCount = Number(bedrooms)
      if (
        Number.isFinite(bedroomCount) &&
        (property.bedrooms_min > bedroomCount || property.bedrooms_max < bedroomCount)
      ) {
        return false
      }
    }

    if (maxPrice) {
      const priceCap = Number(maxPrice)
      if (
        Number.isFinite(priceCap) &&
        property.price !== null &&
        property.price > priceCap
      ) {
        return false
      }
    }

    return true
  })

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900">Encontre seu imovel ideal</h1>
        <p className="text-zinc-500">
          {filteredProperties.length} imove
          {filteredProperties.length !== 1 ? 'is' : 'l'} disponive
          {filteredProperties.length !== 1 ? 'is' : 'l'}
        </p>
      </div>
      <div className="mb-8">
        <PropertyFilters
          cities={cities}
          city={city}
          bedrooms={bedrooms}
          maxPrice={maxPrice}
          onCityChange={setCity}
          onBedroomsChange={setBedrooms}
          onMaxPriceChange={setMaxPrice}
        />
      </div>
      {filteredProperties.length === 0 ? (
        <div className="py-16 text-center text-zinc-400">Nenhum imovel encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </>
  )
}
