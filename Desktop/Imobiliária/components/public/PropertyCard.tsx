import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/types/property'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export function PropertyCard({ property }: { property: Property }) {
  const coverImage = property.property_images?.[0]?.url
  const bedroomsLabel =
    property.bedrooms_min === property.bedrooms_max
      ? `${property.bedrooms_min} quarto${property.bedrooms_min !== 1 ? 's' : ''}`
      : `${property.bedrooms_min}–${property.bedrooms_max} quartos`
  const areaLabel =
    property.area_min === property.area_max
      ? `${property.area_min} m²`
      : `${property.area_min}–${property.area_max} m²`

  return (
    <Link href={`/imovel/${property.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:shadow-md transition-shadow">
        <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">Sem foto</div>
          )}
          {property.is_launch && (
            <div className="absolute top-3 left-3">
              <Badge variant="launch">Lançamento</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-zinc-900 text-base leading-snug line-clamp-2 mb-1">{property.title}</h3>
          <p className="text-sm text-zinc-500 mb-3">
            {property.neighborhood && `${property.neighborhood}, `}{property.city} – {property.state}
          </p>
          <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
            <span>{bedroomsLabel}</span>
            <span>·</span>
            <span>{areaLabel}</span>
          </div>
          <p className="font-semibold text-zinc-900 text-base">{formatPrice(property.price)}</p>
        </div>
      </div>
    </Link>
  )
}
