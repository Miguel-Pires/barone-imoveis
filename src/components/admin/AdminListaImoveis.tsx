'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Imovel } from '@/types/imovel'
import { formatPreco } from '@/lib/format'

const TIPO_LABEL: Record<string, string> = {
  apartamento: 'Apartamento',
  cobertura: 'Cobertura',
  studio: 'Studio',
  loft: 'Loft',
  penthouse: 'Penthouse',
}

interface Props {
  imoveis: Imovel[]
}

export default function AdminListaImoveis({ imoveis }: Props) {
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [bairroFiltro, setBairroFiltro] = useState<string>('')

  const bairros = useMemo(() => {
    const set = new Set(imoveis.map(i => i.endereco.bairro).filter(Boolean))
    return Array.from(set).sort()
  }, [imoveis])

  const tipos = useMemo(() => {
    const set = new Set(imoveis.map(i => i.tipo))
    return Array.from(set).sort()
  }, [imoveis])

  const filtrados = useMemo(() => {
    return imoveis.filter(i => {
      if (busca) {
        const q = busca.toLowerCase()
        const campos = [i.titulo, i.endereco.bairro, i.nomeEmpreendimento ?? ''].join(' ').toLowerCase()
        if (!campos.includes(q)) return false
      }
      if (statusFiltro !== 'todos' && i.statusAnuncio !== statusFiltro) return false
      if (tipoFiltro !== 'todos' && i.tipo !== tipoFiltro) return false
      if (bairroFiltro && i.endereco.bairro !== bairroFiltro) return false
      return true
    })
  }, [imoveis, busca, statusFiltro, tipoFiltro, bairroFiltro])

  const filtrosAtivos = busca || statusFiltro !== 'todos' || tipoFiltro !== 'todos' || bairroFiltro

  function limpar() {
    setBusca('')
    setStatusFiltro('todos')
    setTipoFiltro('todos')
    setBairroFiltro('')
  }

  const inputCls = 'border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-gold)] outline-none transition-colors'

  const statusBadge: Record<string, string> = {
    ativo: 'bg-green-50 text-green-600',
    vendido: 'bg-amber-50 text-amber-600',
    inativo: 'bg-gray-100 text-gray-500',
  }

  return (
    <>
      {/* Barra de busca e filtros */}
      <div className="bg-white border border-[var(--color-border)] p-3 md:p-4 mb-4 space-y-3">
        {/* Busca */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por título ou bairro..."
            className={`${inputCls} w-full pl-10`}
          />
        </div>

        {/* Filtros em linha */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} className={inputCls}>
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="vendido">Vendido</option>
          </select>

          <select value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)} className={inputCls}>
            <option value="todos">Todos os tipos</option>
            {tipos.map(t => <option key={t} value={t}>{TIPO_LABEL[t] ?? t}</option>)}
          </select>

          <select value={bairroFiltro} onChange={e => setBairroFiltro(e.target.value)} className={`${inputCls} col-span-2 md:col-span-1`}>
            <option value="">Todos os bairros</option>
            {bairros.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <div className="flex items-center justify-between col-span-2 md:col-span-1">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-[var(--color-dark)]">{filtrados.length}</span>
              {' '}de {imoveis.length}
            </p>
            {filtrosAtivos && (
              <button type="button" onClick={limpar} className="text-xs text-[var(--color-gold)] hover:text-[var(--color-dark)] transition-colors">
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white border border-[var(--color-border)] overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm mb-3">Nenhum imóvel encontrado.</p>
            {filtrosAtivos && (
              <button type="button" onClick={limpar} className="text-xs text-[var(--color-gold)] hover:underline">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtrados.map(imovel => (
              <Link
                key={imovel.id}
                href={`/admin/imoveis/${imovel.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="w-16 h-12 bg-[var(--color-warm-gray)] shrink-0 overflow-hidden">
                  {imovel.imagens[0] ? (
                    <img src={imovel.imagens[0].url} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-dark)] text-sm truncate">{imovel.titulo}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {imovel.endereco.bairro ? `${imovel.endereco.bairro} · ` : ''}{TIPO_LABEL[imovel.tipo] ?? imovel.tipo} · {imovel.areaTotal}m²
                  </p>
                  <p className="text-xs text-gray-400 md:hidden">{formatPreco(imovel.preco)}</p>
                </div>
                <div className="hidden md:block text-right shrink-0">
                  <p className="text-sm text-[var(--color-dark)] font-light">{formatPreco(imovel.preco)}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${statusBadge[imovel.statusAnuncio] ?? 'bg-gray-100 text-gray-500'}`}>
                    {imovel.statusAnuncio}
                  </span>
                  <span className="text-xs text-[var(--color-gold)]">Editar →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
