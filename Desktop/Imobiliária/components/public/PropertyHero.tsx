'use client'

import { Property } from '@/types/property'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { trackEvent } from '@/lib/tracking'

interface PropertyHeroProps {
  property: Property
  whatsappNumber: string
  leadsCount: number
}

export function PropertyHero({ property, whatsappNumber, leadsCount }: PropertyHeroProps) {
  const socialProofCount = Math.max(leadsCount + property.views_count, 47)
  const waMessage = `Olá, tenho interesse no imóvel ${property.title}`
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`

  const bedroomsLabel =
    property.bedrooms_min === property.bedrooms_max
      ? `${property.bedrooms_min} quarto${property.bedrooms_min !== 1 ? 's' : ''}`
      : `${property.bedrooms_min} e ${property.bedrooms_max} quartos`
  const areaLabel =
    property.area_min === property.area_max
      ? `${property.area_min} m²`
      : `${property.area_min} e ${property.area_max} m²`

  return (
    <section className="bg-white border-b border-zinc-100 px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          {property.is_launch && <Badge variant="launch">Lançamento</Badge>}
          <Badge>{property.city} – {property.state}</Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 leading-tight mb-2">{property.title}</h1>
        <p className="text-zinc-500 mb-2">
          {property.neighborhood && `${property.neighborhood}, `}{property.city} – {property.state}
        </p>
        <p className="text-sm text-zinc-500 mb-6">{bedroomsLabel} · {areaLabel}</p>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-sm text-zinc-500">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
            +{socialProofCount} pessoas demonstraram interesse
          </div>
          {property.urgency_text && (
            <span className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
              {property.urgency_text}
            </span>
          )}
        </div>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('click_whatsapp', { property_id: property.id, source: 'hero' })}
        >
          <Button variant="whatsapp" size="lg" className="w-full sm:w-auto">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.525 5.857L.057 23.077a.75.75 0 0 0 .92.92l5.22-1.468A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.704 9.704 0 0 1-4.951-1.354l-.355-.212-3.682 1.034 1.034-3.682-.212-.355A9.705 9.705 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
            </svg>
            Tenho interesse
          </Button>
        </a>
      </div>
    </section>
  )
}
