'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PropertyImage } from '@/types/property'

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [current, setCurrent] = useState(0)
  const sorted = [...images].sort((a, b) => a.order - b.order)
  if (sorted.length === 0) return null

  function prev() { setCurrent((c) => (c === 0 ? sorted.length - 1 : c - 1)) }
  function next() { setCurrent((c) => (c === sorted.length - 1 ? 0 : c + 1)) }

  return (
    <section className="bg-zinc-900">
      <div className="relative max-w-5xl mx-auto">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image src={sorted[current].url} alt={`${title} — foto ${current + 1}`} fill className="object-cover" priority={current === 0} sizes="(max-width: 1024px) 100vw, 1024px" />
          {sorted.length > 1 && (
            <>
              <button onClick={prev} aria-label="Foto anterior" className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition text-xl">‹</button>
              <button onClick={next} aria-label="Próxima foto" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition text-xl">›</button>
            </>
          )}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md">{current + 1} / {sorted.length}</div>
        </div>
        {sorted.length > 1 && (
          <div className="flex gap-1.5 p-3 overflow-x-auto bg-zinc-900">
            {sorted.map((img, i) => (
              <button key={img.id} onClick={() => setCurrent(i)} className={`flex-shrink-0 relative w-16 h-12 rounded overflow-hidden border-2 transition ${i === current ? 'border-white' : 'border-transparent opacity-60 hover:opacity-80'}`}>
                <Image src={img.url} alt={`Miniatura ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
