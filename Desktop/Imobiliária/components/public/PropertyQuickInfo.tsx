import { Property } from '@/types/property'

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-4 bg-zinc-50 rounded-2xl text-center">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-semibold text-zinc-900">{value}</span>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
  )
}

export function PropertyQuickInfo({ property }: { property: Property }) {
  const bedroomsValue = property.bedrooms_min === property.bedrooms_max ? String(property.bedrooms_min) : `${property.bedrooms_min}–${property.bedrooms_max}`
  const areaValue = property.area_min === property.area_max ? `${property.area_min} m²` : `${property.area_min}–${property.area_max} m²`

  return (
    <section className="px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Informações</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoItem icon="🛏" label="Quartos" value={bedroomsValue} />
          <InfoItem icon="📐" label="Área" value={areaValue} />
          <InfoItem icon="🚿" label="Banheiros" value={String(property.bathrooms)} />
          <InfoItem icon="🚗" label="Vagas" value={property.parking === 0 ? 'Sem vaga' : `até ${property.parking}`} />
        </div>
      </div>
    </section>
  )
}
