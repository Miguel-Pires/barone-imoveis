'use client'

import { useState } from 'react'
import { Imagem } from '@/types/imovel'

interface Props {
  imagens: Imagem[]
  titulo: string
}

export default function GaleriaFotos({ imagens, titulo }: Props) {
  const [ativa, setAtiva] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (imagens.length === 0) {
    return (
      <div className="w-full aspect-[16/7] bg-[var(--color-warm-gray)] flex items-center justify-center">
        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  const sorted = [...imagens].sort((a, b) => a.ordem - b.ordem)

  const prev = () => setAtiva(i => (i - 1 + sorted.length) % sorted.length)
  const next = () => setAtiva(i => (i + 1) % sorted.length)

  return (
    <>
      <div className="w-full bg-[var(--color-dark)]">
        {/* Imagem principal */}
        <div
          className="relative cursor-zoom-in"
          style={{ aspectRatio: '16/7', maxHeight: '70vh' }}
          onClick={() => setLightbox(true)}
        >
          <img
            src={sorted[ativa].url}
            alt={sorted[ativa].alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          {/* Navegação */}
          {sorted.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white hover:bg-black/80 transition-colors flex items-center justify-center backdrop-blur-sm"
                aria-label="Foto anterior"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white hover:bg-black/80 transition-colors flex items-center justify-center backdrop-blur-sm"
                aria-label="Próxima foto"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 backdrop-blur-sm tracking-wide">
            {ativa + 1} / {sorted.length}
          </div>

          <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-3 py-1.5 backdrop-blur-sm">
            <svg className="w-4 h-4 inline mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            Ampliar
          </div>
        </div>

        {/* Thumbnails */}
        {sorted.length > 1 && (
          <div className="flex gap-1 p-2 bg-black overflow-x-auto">
            {sorted.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setAtiva(idx)}
                className={`shrink-0 w-16 h-12 overflow-hidden transition-all ${idx === ativa ? 'ring-2 ring-[var(--color-gold)] opacity-100' : 'opacity-50 hover:opacity-80'}`}
              >
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <img
            src={sorted[ativa].url}
            alt={sorted[ativa].alt}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {ativa + 1} / {sorted.length} — {sorted[ativa].alt}
          </p>
        </div>
      )}
    </>
  )
}
