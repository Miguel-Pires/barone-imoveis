'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PropertyFloorplan } from '@/types/property'

export function PropertyFloorplans({ floorplans }: { floorplans: PropertyFloorplan[] }) {
  const [active, setActive] = useState(0)
  if (floorplans.length === 0) return null
  const current = floorplans[active]

  return (
    <section className="px-4 py-10 border-t border-zinc-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Plantas</h2>
        {floorplans.length > 1 && (
          <div className="flex gap-2 mb-4">
            {floorplans.map((fp, i) => (
              <button key={fp.id} onClick={() => setActive(i)} className={`px-4 py-2 rounded-xl text-sm transition ${i === active ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>{fp.label}</button>
            ))}
          </div>
        )}
        <div className="relative aspect-[4/3] bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100">
          <Image src={current.url} alt={current.label} fill className="object-contain" sizes="(max-width: 1024px) 100vw, 800px" />
        </div>
        <div className="mt-4">
          <a href={current.url} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition">
            ↓ Baixar planta — {current.label}
          </a>
        </div>
      </div>
    </section>
  )
}
