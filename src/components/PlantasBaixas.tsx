'use client'

import { useState } from 'react'
import { PlantaBaixa } from '@/types/imovel'

interface Props {
  plantas: PlantaBaixa[]
}

export default function PlantasBaixas({ plantas }: Props) {
  const unidade = plantas.filter(p => p.tipo === 'unidade')
  const edificio = plantas.filter(p => p.tipo === 'edificio')
  const [aba, setAba] = useState<'unidade' | 'edificio'>(unidade.length > 0 ? 'unidade' : 'edificio')
  const [plantaSelecionada, setPlantaSelecionada] = useState<PlantaBaixa | null>(null)

  const listaAtual = aba === 'unidade' ? unidade : edificio

  return (
    <div className="mb-12">
      <h2
        className="text-2xl font-light text-[var(--color-dark)] mb-6 gold-line"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        Plantas Baixas
      </h2>

      {/* Abas */}
      <div className="flex gap-0 mt-6 mb-6 border-b border-[var(--color-border)]">
        {unidade.length > 0 && (
          <button
            onClick={() => setAba('unidade')}
            className={`px-5 py-2.5 text-xs tracking-widest uppercase transition-all border-b-2 -mb-px ${
              aba === 'unidade'
                ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                : 'border-transparent text-gray-400 hover:text-[var(--color-dark)]'
            }`}
          >
            Apartamento
          </button>
        )}
        {edificio.length > 0 && (
          <button
            onClick={() => setAba('edificio')}
            className={`px-5 py-2.5 text-xs tracking-widest uppercase transition-all border-b-2 -mb-px ${
              aba === 'edificio'
                ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                : 'border-transparent text-gray-400 hover:text-[var(--color-dark)]'
            }`}
          >
            Edifício
          </button>
        )}
      </div>

      {/* Grid de plantas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {listaAtual.map((planta) => (
          <button
            key={planta.id}
            onClick={() => setPlantaSelecionada(planta)}
            className="group text-left border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all overflow-hidden"
          >
            <div className="relative aspect-[4/3] bg-[var(--color-warm-gray)] overflow-hidden">
              <img
                src={planta.imagemUrl}
                alt={planta.titulo}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-gold)] text-white text-xs tracking-widest uppercase px-4 py-2">
                  Ver planta
                </span>
              </div>
            </div>
            <div className="p-4">
              <p
                className="text-base font-light text-[var(--color-dark)] mb-1"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {planta.titulo}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-gold)] tracking-wide">{planta.tipologia}</span>
                {planta.areaTotal > 0 && (
                  <span className="text-xs text-gray-400">{planta.areaTotal}m²</span>
                )}
              </div>
              {planta.descricao && (
                <p className="text-xs text-gray-400 mt-1">{planta.descricao}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Modal lightbox */}
      {plantaSelecionada && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setPlantaSelecionada(null)}
        >
          <div
            className="bg-white max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <div>
                <h3
                  className="text-xl font-light text-[var(--color-dark)]"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {plantaSelecionada.titulo}
                </h3>
                <p className="text-xs text-[var(--color-gold)] tracking-wide mt-0.5">
                  {plantaSelecionada.tipologia}
                  {plantaSelecionada.areaTotal > 0 && ` · ${plantaSelecionada.areaTotal}m²`}
                </p>
              </div>
              <button
                onClick={() => setPlantaSelecionada(null)}
                className="text-gray-400 hover:text-[var(--color-dark)] p-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <img
                src={plantaSelecionada.imagemUrl}
                alt={plantaSelecionada.titulo}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
