'use client'

interface PropertyFiltersProps {
  cities: string[]
  city: string
  bedrooms: string
  maxPrice: string
  onCityChange: (value: string) => void
  onBedroomsChange: (value: string) => void
  onMaxPriceChange: (value: string) => void
}

export function PropertyFilters({
  cities,
  city,
  bedrooms,
  maxPrice,
  onCityChange,
  onBedroomsChange,
  onMaxPriceChange,
}: PropertyFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <select
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
      >
        <option value="">Todas as cidades</option>
        {cities.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        value={bedrooms}
        onChange={(e) => onBedroomsChange(e.target.value)}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
      >
        <option value="">Quartos</option>
        {[1, 2, 3, 4].map((item) => (
          <option key={item} value={item}>
            {item}+ quartos
          </option>
        ))}
      </select>
      <select
        value={maxPrice}
        onChange={(e) => onMaxPriceChange(e.target.value)}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
      >
        <option value="">Preco maximo</option>
        <option value="300000">Ate R$ 300.000</option>
        <option value="500000">Ate R$ 500.000</option>
        <option value="800000">Ate R$ 800.000</option>
        <option value="1200000">Ate R$ 1.200.000</option>
      </select>
    </div>
  )
}
