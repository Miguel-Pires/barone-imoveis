import { PropertyAmenity } from '@/types/property'

export function PropertyAmenities({ amenities }: { amenities: PropertyAmenity[] }) {
  if (amenities.length === 0) return null
  return (
    <section className="px-4 py-10 border-t border-zinc-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Amenidades</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {amenities.map((a) => (
            <div key={a.id} className="px-4 py-3 bg-zinc-50 rounded-xl text-sm text-zinc-700 text-center">{a.name}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
