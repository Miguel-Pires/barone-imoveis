import { Suspense } from 'react'
import { PropertyCatalog } from '@/components/public/PropertyCatalog'
import { getProperties, getUniqueCities } from '@/services/properties'

export const revalidate = 60

export default async function HomePage() {
  const [properties, cities] = await Promise.all([
    getProperties(),
    getUniqueCities(),
  ])

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-100 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-semibold tracking-tight text-zinc-900">
            Barone Imoveis
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Suspense fallback={<div className="py-16 text-center text-zinc-400">Carregando filtros...</div>}>
          <PropertyCatalog properties={properties} cities={cities} />
        </Suspense>
      </div>
    </main>
  )
}
