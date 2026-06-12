'use client'

import { useState, useMemo } from 'react'
import { Imovel } from '@/types/imovel'
import ImovelCard from './ImovelCard'

interface Props {
  imoveis: Imovel[]
}

function BtnFiltro({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs tracking-wide border transition-colors whitespace-nowrap ${
        ativo
          ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)]'
          : 'border-[var(--color-border)] text-gray-500 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]'
      }`}
    >
      {children}
    </button>
  )
}

export default function CatalogoImoveis({ imoveis }: Props) {
  const [busca, setBusca] = useState('')
  const [bairro, setBairro] = useState('')
  const [tipo, setTipo] = useState('')
  const [quartos, setQuartos] = useState<number | null>(null)
  const [suites, setSuites] = useState<number | null>(null)
  const [vagas, setVagas] = useState<number | null>(null)
  const [precoMin, setPrecoMin] = useState<number | ''>('')
  const [precoMax, setPrecoMax] = useState<number | ''>('')
  const [areaMin, setAreaMin] = useState<number | ''>('')
  const [areaMax, setAreaMax] = useState<number | ''>('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const bairros = useMemo(() => {
    const set = new Set(imoveis.map(i => i.endereco.bairro).filter(Boolean))
    return Array.from(set).sort()
  }, [imoveis])

  const filtrosAtivos = !!(busca || bairro || tipo || quartos !== null || suites !== null || vagas !== null || precoMin !== '' || precoMax !== '' || areaMin !== '' || areaMax !== '')

  function limparFiltros() {
    setBusca('')
    setBairro('')
    setTipo('')
    setQuartos(null)
    setSuites(null)
    setVagas(null)
    setPrecoMin('')
    setPrecoMax('')
    setAreaMin('')
    setAreaMax('')
  }

  const filtrados = useMemo(() => {
    return imoveis.filter(i => {
      if (busca) {
        const q = busca.toLowerCase()
        const campos = [i.titulo, i.endereco.bairro, i.nomeEmpreendimento ?? ''].join(' ').toLowerCase()
        if (!campos.includes(q)) return false
      }
      if (bairro && i.endereco.bairro !== bairro) return false
      if (tipo && i.tipo !== tipo) return false
      if (quartos !== null) {
        if (i.quartos == null) return false
        if (quartos === 4 ? i.quartos < 4 : i.quartos !== quartos) return false
      }
      if (suites !== null) {
        const s = i.suites ?? 0
        if (suites === 2 ? s < 2 : s !== suites) return false
      }
      if (vagas !== null) {
        const v = i.vagas ?? 0
        if (vagas === 2 ? v < 2 : v !== vagas) return false
      }
      if (precoMin !== '' && i.preco < precoMin) return false
      if (precoMax !== '' && i.preco > precoMax) return false
      if (areaMin !== '' && i.areaTotal < areaMin) return false
      if (areaMax !== '' && i.areaTotal > areaMax) return false
      return true
    })
  }, [imoveis, busca, bairro, quartos, suites, vagas, precoMin, precoMax, areaMin, areaMax])

  const destaques = filtrados.filter(i => i.destaque)
  const outros = filtrados.filter(i => !i.destaque)

  const inputCls = 'border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-gold)] outline-none transition-colors w-full'

  return (
    <section id="imoveis" className="max-w-7xl mx-auto px-6 py-24">
      {/* Cabeçalho + busca */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
          <div>
            <p className="text-[var(--color-gold)] text-xs tracking-[0.3em] uppercase mb-3">Encontre o seu</p>
            <h2 className="text-4xl md:text-5xl font-light text-[var(--color-dark)] gold-line" style={{ fontFamily: 'var(--font-serif)' }}>
              Imóveis Disponíveis
            </h2>
          </div>
          {filtrosAtivos && (
            <p className="text-sm text-gray-500 shrink-0">
              <span className="font-medium text-[var(--color-dark)]">{filtrados.length}</span>{' '}
              imóvel{filtrados.length !== 1 ? 'is' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Barra de busca */}
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome, bairro ou empreendimento..."
              className="w-full border border-[var(--color-border)] bg-white pl-10 pr-4 py-3 text-sm focus:border-[var(--color-gold)] outline-none transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setMostrarFiltros(v => !v)}
            className={`flex items-center gap-2 px-5 py-3 border text-sm tracking-wide transition-colors whitespace-nowrap shrink-0 ${
              mostrarFiltros
                ? 'bg-[var(--color-dark)] text-white border-[var(--color-dark)]'
                : 'border-[var(--color-border)] text-gray-600 hover:border-[var(--color-dark)] hover:text-[var(--color-dark)]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            <span>Filtros</span>
            {filtrosAtivos && <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] shrink-0" />}
          </button>
        </div>

        {/* Painel de filtros */}
        {mostrarFiltros && (
          <div className="border border-[var(--color-border)] bg-white p-4 md:p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-2">Tipo</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)} className={inputCls}>
                  <option value="">Todos</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="studio">Studio</option>
                  <option value="cobertura">Cobertura</option>
                  <option value="loft">Loft</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="terreno">Terreno</option>
                  <option value="loteamento">Loteamento</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-2">Bairro</label>
                <select value={bairro} onChange={e => setBairro(e.target.value)} className={inputCls}>
                  <option value="">Todos</option>
                  {bairros.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-2">Preço mínimo (R$)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={precoMin}
                  onChange={e => setPrecoMin(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ex: 500000"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-2">Preço máximo (R$)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={precoMax}
                  onChange={e => setPrecoMax(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ex: 2000000"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-gray-400 mb-2">Área (m²)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={areaMin}
                    onChange={e => setAreaMin(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Mín"
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={0}
                    value={areaMax}
                    onChange={e => setAreaMax(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Máx"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 border-t border-[var(--color-border)]">
              <div>
                <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-2">Dormitórios</p>
                <div className="flex gap-1.5 flex-wrap">
                  <BtnFiltro ativo={quartos === null} onClick={() => setQuartos(null)}>Todos</BtnFiltro>
                  {[1, 2, 3].map(n => (
                    <BtnFiltro key={n} ativo={quartos === n} onClick={() => setQuartos(quartos === n ? null : n)}>{n}</BtnFiltro>
                  ))}
                  <BtnFiltro ativo={quartos === 4} onClick={() => setQuartos(quartos === 4 ? null : 4)}>4+</BtnFiltro>
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-2">Suítes</p>
                <div className="flex gap-1.5 flex-wrap">
                  <BtnFiltro ativo={suites === null} onClick={() => setSuites(null)}>Todas</BtnFiltro>
                  <BtnFiltro ativo={suites === 1} onClick={() => setSuites(suites === 1 ? null : 1)}>1</BtnFiltro>
                  <BtnFiltro ativo={suites === 2} onClick={() => setSuites(suites === 2 ? null : 2)}>2+</BtnFiltro>
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-2">Vagas</p>
                <div className="flex gap-1.5 flex-wrap">
                  <BtnFiltro ativo={vagas === null} onClick={() => setVagas(null)}>Todas</BtnFiltro>
                  <BtnFiltro ativo={vagas === 0} onClick={() => setVagas(vagas === 0 ? null : 0)}>0</BtnFiltro>
                  <BtnFiltro ativo={vagas === 1} onClick={() => setVagas(vagas === 1 ? null : 1)}>1</BtnFiltro>
                  <BtnFiltro ativo={vagas === 2} onClick={() => setVagas(vagas === 2 ? null : 2)}>2+</BtnFiltro>
                </div>
              </div>
            </div>

            {filtrosAtivos && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="text-xs text-[var(--color-gold)] hover:text-[var(--color-dark)] transition-colors"
                >
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resultados */}
      {filtrados.length === 0 ? (
        <div className="text-center py-20 border border-[var(--color-border)]">
          <p className="text-gray-400 text-lg" style={{ fontFamily: 'var(--font-serif)' }}>Nenhum imóvel encontrado.</p>
          <p className="text-gray-500 text-sm mt-2">Tente ajustar os filtros ou entre em contato.</p>
          <button type="button" onClick={limparFiltros} className="mt-4 text-sm text-[var(--color-gold)] hover:underline">
            Limpar filtros
          </button>
        </div>
      ) : filtrosAtivos ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map(imovel => <ImovelCard key={imovel.id} imovel={imovel} />)}
        </div>
      ) : (
        <>
          {destaques.length > 0 && (
            <>
              <div className="mb-12">
                <p className="text-[var(--color-gold)] text-xs tracking-[0.3em] uppercase mb-3">Selecionados para você</p>
                <h3 className="text-4xl md:text-5xl font-light text-[var(--color-dark)] gold-line" style={{ fontFamily: 'var(--font-serif)' }}>
                  Imóveis em Destaque
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                {destaques.map(imovel => <ImovelCard key={imovel.id} imovel={imovel} />)}
              </div>
            </>
          )}

          {outros.length > 0 && (
            <>
              <div className="mb-12">
                <h3 className="text-4xl md:text-5xl font-light text-[var(--color-dark)] gold-line" style={{ fontFamily: 'var(--font-serif)' }}>
                  {destaques.length > 0 ? 'Outros Imóveis' : 'Todos os Imóveis'}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outros.map(imovel => <ImovelCard key={imovel.id} imovel={imovel} />)}
              </div>
            </>
          )}

          {imoveis.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg" style={{ fontFamily: 'var(--font-serif)' }}>Novos imóveis em breve.</p>
              <p className="text-gray-500 text-sm mt-2">Entre em contato para saber das últimas oportunidades.</p>
            </div>
          )}
        </>
      )}
    </section>
  )
}
