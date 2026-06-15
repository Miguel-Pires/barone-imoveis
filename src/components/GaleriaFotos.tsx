'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Imagem } from '@/types/imovel'

interface Props {
  imagens: Imagem[]
  titulo: string
}

export default function GaleriaFotos({ imagens, titulo }: Props) {
  const [ativa, setAtiva] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null)
  const touchStartX = useRef<number | null>(null)
  const didSwipe = useRef(false)

  const sorted = [...imagens].sort((a, b) => a.ordem - b.ordem)

  const goTo = useCallback((idx: number, dir: 'left' | 'right') => {
    setAnimDir(dir)
    setTimeout(() => {
      setAtiva(idx)
      setAnimDir(null)
    }, 150)
  }, [])

  const prev = useCallback(() => {
    goTo((ativa - 1 + sorted.length) % sorted.length, 'right')
  }, [ativa, sorted.length, goTo])

  const next = useCallback(() => {
    goTo((ativa + 1) % sorted.length, 'left')
  }, [ativa, sorted.length, goTo])

  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, prev, next])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.targetTouches[0].clientX
    didSwipe.current = false
  }

  function onTouchEnd(e: React.TouchEvent, goNext: () => void, goPrev: () => void) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      didSwipe.current = true
      diff > 0 ? goNext() : goPrev()
    }
    touchStartX.current = null
  }

  if (sorted.length === 0) {
    return (
      <div className="w-full bg-[var(--color-warm-gray)] aspect-[4/3] md:aspect-auto md:h-[65vh] flex items-center justify-center">
        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  return (
    <>
      <div className="w-full bg-[var(--color-dark)] select-none">
        {/* Imagem principal */}
        <div
          className="relative overflow-hidden w-full aspect-[4/3] md:aspect-auto md:h-[65vh] cursor-pointer md:cursor-zoom-in"
          onClick={() => { if (!didSwipe.current) setLightbox(true) }}
          onTouchStart={onTouchStart}
          onTouchEnd={e => onTouchEnd(e, next, prev)}
        >
          <Image
            key={sorted[ativa].id}
            src={sorted[ativa].url}
            alt={sorted[ativa].alt}
            fill
            sizes="100vw"
            quality={70}
            className="object-contain object-center transition-opacity duration-200"
            style={{ opacity: animDir ? 0 : 1 }}
            draggable={false}
            priority={ativa === 0}
          />

          {/* Pré-carrega as 2 fotos anteriores e as 2 seguintes */}
          {sorted.length > 1 && [-2, -1, 1, 2].map(offset => {
            const idx = (ativa + offset + sorted.length) % sorted.length
            if (idx === ativa) return null
            return (
              <div key={`pre-${sorted[idx].id}`} aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0 }}>
                <Image src={sorted[idx].url} alt="" fill sizes="100vw" quality={70} priority />
              </div>
            )
          })}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {sorted.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-black/50 hover:bg-black/80 active:bg-black/80 text-white transition-all flex items-center justify-center backdrop-blur-sm"
                aria-label="Foto anterior"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 bg-black/50 hover:bg-black/80 active:bg-black/80 text-white transition-all flex items-center justify-center backdrop-blur-sm"
                aria-label="Próxima foto"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Dots — mobile */}
          {sorted.length > 1 && sorted.length <= 15 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden pointer-events-auto">
              {sorted.map((_, idx) => (
                <button
                  key={idx}
                  onClick={e => { e.stopPropagation(); goTo(idx, idx > ativa ? 'left' : 'right') }}
                  className={`rounded-full transition-all ${idx === ativa ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          )}

          {/* Contador + ampliar */}
          <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex items-center gap-2">
            <span className="hidden md:flex items-center gap-1.5 bg-black/60 text-white text-[10px] px-2.5 py-1.5 backdrop-blur-sm tracking-wide">
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              Ampliar
            </span>
            <span className="bg-black/60 text-white text-[10px] px-2.5 py-1.5 backdrop-blur-sm tracking-widest">
              {ativa + 1} / {sorted.length}
            </span>
          </div>
        </div>

        {/* Thumbnails — apenas desktop */}
        {sorted.length > 1 && (
          <div className="hidden md:flex bg-[#111] gap-1 p-1.5 overflow-x-auto">
            {sorted.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => goTo(idx, idx > ativa ? 'left' : 'right')}
                className={`shrink-0 overflow-hidden transition-all duration-200 ${
                  idx === ativa ? 'ring-2 ring-[var(--color-gold)] opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
                style={{ width: 64, height: 44 }}
                title={img.alt}
              >
                <Image src={img.url} alt={img.alt} width={64} height={44} className="w-full h-full object-cover" draggable={false} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/97 flex items-center justify-center"
          onClick={() => { if (!didSwipe.current) setLightbox(false) }}
          onTouchStart={onTouchStart}
          onTouchEnd={e => onTouchEnd(e, next, prev)}
        >
          {/* Fechar */}
          <button
            onClick={e => { e.stopPropagation(); setLightbox(false) }}
            className="absolute top-4 right-4 text-white/60 hover:text-white active:text-white p-2 transition-colors z-10"
            aria-label="Fechar"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Anterior */}
          {sorted.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white active:text-white p-3 transition-colors z-10"
              aria-label="Anterior"
            >
              <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Imagem */}
          <div
            className="relative w-full h-full px-2 md:px-14 py-14"
            onClick={e => e.stopPropagation()}
          >
            <Image
              key={sorted[ativa].id}
              src={sorted[ativa].url}
              alt={sorted[ativa].alt}
              fill
              sizes="(max-width: 768px) 100vw, 90vw"
              quality={70}
              className="object-contain"
              priority
              draggable={false}
            />
          </div>

          {/* Próxima */}
          {sorted.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white active:text-white p-3 transition-colors z-10"
              aria-label="Próxima"
            >
              <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Thumbnails — desktop */}
          {sorted.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex gap-1.5 max-w-[80vw] overflow-x-auto px-4">
              {sorted.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={e => { e.stopPropagation(); goTo(idx, idx > ativa ? 'left' : 'right') }}
                  className={`shrink-0 overflow-hidden transition-all ${
                    idx === ativa ? 'ring-2 ring-[var(--color-gold)] opacity-100' : 'opacity-30 hover:opacity-60'
                  }`}
                  style={{ width: 52, height: 36 }}
                >
                  <Image src={img.url} alt="" width={52} height={36} className="w-full h-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          )}

          {/* Dots — mobile lightbox */}
          {sorted.length > 1 && sorted.length <= 15 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
              {sorted.map((_, idx) => (
                <button
                  key={idx}
                  onClick={e => { e.stopPropagation(); goTo(idx, idx > ativa ? 'left' : 'right') }}
                  className={`rounded-full transition-all ${idx === ativa ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
                />
              ))}
            </div>
          )}

          <p className="absolute bottom-14 md:bottom-4 right-4 text-white/30 text-xs tracking-widest pointer-events-none">
            {ativa + 1} / {sorted.length}
          </p>
        </div>
      )}
    </>
  )
}
