'use client'

import { useState } from 'react'
import { PlantaBaixa } from '@/types/imovel'

function formatPreco(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)
}

interface Props {
  plantas: PlantaBaixa[]
}

export default function PlantasBaixas({ plantas }: Props) {
  const unidade = plantas.filter(p => p.tipo === 'unidade')
  const edificio = plantas.filter(p => p.tipo === 'edificio')
  const hasAmbos = unidade.length > 0 && edificio.length > 0
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
      {hasAmbos && (
        <div className="flex gap-0 mt-6 mb-6 border-b border-[var(--color-border)]">
          <button
            onClick={() => setAba('unidade')}
            className={`px-5 py-2.5 text-xs tracking-widest uppercase transition-all border-b-2 -mb-px ${
              aba === 'unidade'
                ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                : 'border-transparent text-gray-400 hover:text-[var(--color-dark)]'
            }`}
          >
            Apartamento
            {unidade.length > 1 && (
              <span className="ml-2 text-[9px] bg-[var(--color-warm-gray)] text-gray-500 px-1.5 py-0.5">
                {unidade.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setAba('edificio')}
            className={`px-5 py-2.5 text-xs tracking-widest uppercase transition-all border-b-2 -mb-px ${
              aba === 'edificio'
                ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                : 'border-transparent text-gray-400 hover:text-[var(--color-dark)]'
            }`}
          >
            Edifício
            {edificio.length > 1 && (
              <span className="ml-2 text-[9px] bg-[var(--color-warm-gray)] text-gray-500 px-1.5 py-0.5">
                {edificio.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Grid de plantas */}
      <div className={`grid gap-4 ${!hasAmbos ? 'mt-6' : ''} ${listaAtual.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {listaAtual.map((planta) => (
          <button
            key={planta.id}
            onClick={() => setPlantaSelecionada(planta)}
            className="group text-left border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all overflow-hidden"
          >
            <div className="relative bg-[var(--color-warm-gray)] overflow-hidden" style={{ aspectRatio: '4/3' }}>
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
              <p className="text-base font-light text-[var(--color-dark)] mb-1.5" style={{ fontFamily: 'var(--font-serif)' }}>
                {planta.titulo}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] tracking-[0.2em] text-[var(--color-gold)] uppercase font-medium">
                  {planta.tipologia}
                </span>
                {planta.areaTotal > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 bg-[var(--color-warm-gray)] px-2 py-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    {planta.areaTotal}m²
                  </span>
                )}
              </div>
              {planta.preco != null && planta.preco > 0 && (
                <p className="text-sm font-light text-[var(--color-dark)] mt-1.5" style={{ fontFamily: 'var(--font-serif)' }}>
                  {formatPreco(planta.preco)}
                </p>
              )}
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
                <h3 className="text-xl font-light text-[var(--color-dark)]" style={{ fontFamily: 'var(--font-serif)' }}>
                  {plantaSelecionada.titulo}
                </h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-[10px] text-[var(--color-gold)] tracking-[0.2em] uppercase">
                    {plantaSelecionada.tipologia}
                  </span>
                  {plantaSelecionada.areaTotal > 0 && (
                    <span className="text-xs text-gray-500 bg-[var(--color-warm-gray)] px-2 py-0.5">
                      {plantaSelecionada.areaTotal}m²
                    </span>
                  )}
                  {plantaSelecionada.preco != null && plantaSelecionada.preco > 0 && (
                    <span className="text-sm font-light text-[var(--color-dark)]" style={{ fontFamily: 'var(--font-serif)' }}>
                      {formatPreco(plantaSelecionada.preco)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPlantaSelecionada(null)}
                className="text-gray-400 hover:text-[var(--color-dark)] p-1 transition-colors"
                aria-label="Fechar"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 bg-[var(--color-warm-gray)]">
              <img
                src={plantaSelecionada.imagemUrl}
                alt={plantaSelecionada.titulo}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Navegação entre plantas do mesmo tipo */}
            {listaAtual.length > 1 && (
              <div className="px-6 py-3 border-t border-[var(--color-border)] flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] text-gray-400 tracking-widest uppercase shrink-0 mr-2">Outras opções:</span>
                {listaAtual.filter(p => p.id !== plantaSelecionada.id).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPlantaSelecionada(p)}
                    className="shrink-0 border border-[var(--color-border)] hover:border-[var(--color-gold)] px-3 py-1.5 text-xs transition-colors"
                  >
                    {p.tipologia}{p.areaTotal > 0 ? ` · ${p.areaTotal}m²` : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
