import { PropertyFeature } from '@/types/property'

export function PropertyFeatures({ features }: { features: PropertyFeature[] }) {
  if (features.length === 0) return null
  return (
    <section className="px-4 py-10 border-t border-zinc-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Diferenciais</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((f) => (
            <li key={f.id} className="flex items-center gap-3 text-zinc-700 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 flex-shrink-0" />
              {f.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
