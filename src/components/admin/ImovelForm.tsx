'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Imovel, Imagem, PlantaBaixa } from '@/types/imovel'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  imovel?: Imovel
}

const DEFAULT: Partial<Imovel> = {
  titulo: '',
  subtitulo: '',
  descricao: '',
  tipo: 'apartamento',
  status: 'pronto',
  statusAnuncio: 'ativo',
  preco: 0,
  precoCondominio: 0,
  precoIPTU: 0,
  areaTotal: 0,
  areaUtil: 0,
  quartos: 1,
  banheiros: 1,
  vagas: 1,
  suites: 0,
  andarUnidade: undefined,
  totalAndares: undefined,
  diferenciais: [],
  imagens: [],
  plantasBaixas: [],
  endereco: {
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '',
  },
  destaque: false,
}

export default function ImovelForm({ imovel }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<Partial<Imovel>>(imovel ?? DEFAULT)
  const [diferencial, setDiferencial] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const plantaRef = useRef<HTMLInputElement>(null)

  const isEdit = !!imovel

  function set(path: string, value: unknown) {
    setForm(prev => {
      const next = { ...prev }
      const parts = path.split('.')
      let obj: Record<string, unknown> = next as Record<string, unknown>
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...(obj[parts[i]] as Record<string, unknown>) }
        obj = obj[parts[i]] as Record<string, unknown>
      }
      obj[parts[parts.length - 1]] = value
      return next
    })
  }

  async function uploadFoto(file: File): Promise<string | null> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) return null
    const { url } = await res.json()
    return url
  }

  async function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    const novas: Imagem[] = []
    const ordem = (form.imagens?.length ?? 0)
    for (const file of files) {
      const url = await uploadFoto(file)
      if (url) novas.push({ id: uuidv4(), url, alt: file.name.replace(/\.[^.]+$/, ''), ordem: ordem + novas.length })
    }
    setForm(prev => ({ ...prev, imagens: [...(prev.imagens ?? []), ...novas] }))
    setUploading(false)
    e.target.value = ''
  }

  async function handlePlanta(e: React.ChangeEvent<HTMLInputElement>, tipo: 'unidade' | 'edificio') {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadFoto(file)
    if (url) {
      const nova: PlantaBaixa = {
        id: uuidv4(),
        titulo: file.name.replace(/\.[^.]+$/, ''),
        tipologia: tipo === 'unidade' ? 'Apartamento' : 'Edifício',
        areaTotal: 0,
        imagemUrl: url,
        tipo,
      }
      setForm(prev => ({ ...prev, plantasBaixas: [...(prev.plantasBaixas ?? []), nova] }))
    }
    setUploading(false)
    e.target.value = ''
  }

  function removerImagem(id: string) {
    setForm(prev => ({
      ...prev,
      imagens: (prev.imagens ?? []).filter(i => i.id !== id),
    }))
  }

  function removerPlanta(id: string) {
    setForm(prev => ({
      ...prev,
      plantasBaixas: (prev.plantasBaixas ?? []).filter(p => p.id !== id),
    }))
  }

  function adicionarDiferencial() {
    if (!diferencial.trim()) return
    setForm(prev => ({
      ...prev,
      diferenciais: [...(prev.diferenciais ?? []), diferencial.trim()],
    }))
    setDiferencial('')
  }

  function removerDiferencial(item: string) {
    setForm(prev => ({
      ...prev,
      diferenciais: (prev.diferenciais ?? []).filter(d => d !== item),
    }))
  }

  function setDestaque(id: string) {
    setForm(prev => ({
      ...prev,
      imagens: (prev.imagens ?? []).map(img => ({ ...img, destaque: img.id === id })),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    const url = isEdit ? `/api/imoveis/${imovel!.id}` : '/api/imoveis'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setMsg(isEdit ? 'Imóvel atualizado com sucesso!' : 'Imóvel criado com sucesso!')
      if (!isEdit) {
        const data = await res.json()
        router.push(`/admin/imoveis/${data.id}`)
      }
    } else {
      setMsg('Erro ao salvar. Tente novamente.')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!imovel || !confirm('Tem certeza que deseja excluir este imóvel?')) return
    const res = await fetch(`/api/imoveis/${imovel.id}`, { method: 'DELETE' })
    if (res.ok) router.push('/admin/imoveis')
  }

  const inputCls = 'w-full border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-gold)] outline-none transition-colors'
  const labelCls = 'block text-[10px] tracking-widest uppercase text-gray-400 mb-1.5'
  const sectionCls = 'bg-white border border-[var(--color-border)] p-6 mb-6'

  return (
    <form onSubmit={handleSubmit}>
      {/* Informações básicas */}
      <div className={sectionCls}>
        <h2 className="text-lg font-light mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Informações Básicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Título do imóvel *</label>
            <input className={inputCls} value={form.titulo ?? ''} onChange={e => set('titulo', e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Subtítulo</label>
            <input className={inputCls} value={form.subtitulo ?? ''} onChange={e => set('subtitulo', e.target.value)} placeholder="Frase de impacto opcional" />
          </div>
          <div>
            <label className={labelCls}>Tipo *</label>
            <select className={inputCls} value={form.tipo} onChange={e => set('tipo', e.target.value)} required>
              <option value="apartamento">Apartamento</option>
              <option value="studio">Studio</option>
              <option value="cobertura">Cobertura</option>
              <option value="loft">Loft</option>
              <option value="penthouse">Penthouse</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Status do imóvel *</label>
            <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)} required>
              <option value="lancamento">Lançamento</option>
              <option value="em_construcao">Em Construção</option>
              <option value="pronto">Pronto para Morar</option>
              <option value="usado">Revenda</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Status do anúncio *</label>
            <select className={inputCls} value={form.statusAnuncio} onChange={e => set('statusAnuncio', e.target.value)} required>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="destaque"
              checked={form.destaque ?? false}
              onChange={e => set('destaque', e.target.checked)}
              className="w-4 h-4 accent-[var(--color-gold)]"
            />
            <label htmlFor="destaque" className="text-sm text-gray-600">Exibir como destaque na homepage</label>
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Descrição *</label>
            <textarea
              className={`${inputCls} min-h-[120px] resize-y`}
              value={form.descricao ?? ''}
              onChange={e => set('descricao', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className={sectionCls}>
        <h2 className="text-lg font-light mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Valores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Preço (R$) *</label>
            <input type="number" className={inputCls} value={form.preco ?? 0} onChange={e => set('preco', Number(e.target.value))} required min={0} />
          </div>
          <div>
            <label className={labelCls}>Condomínio (R$/mês)</label>
            <input type="number" className={inputCls} value={form.precoCondominio ?? ''} onChange={e => set('precoCondominio', Number(e.target.value))} min={0} />
          </div>
          <div>
            <label className={labelCls}>IPTU (R$/ano)</label>
            <input type="number" className={inputCls} value={form.precoIPTU ?? ''} onChange={e => set('precoIPTU', Number(e.target.value))} min={0} />
          </div>
        </div>
      </div>

      {/* Características */}
      <div className={sectionCls}>
        <h2 className="text-lg font-light mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Características</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Área total (m²) *</label>
            <input type="number" className={inputCls} value={form.areaTotal ?? 0} onChange={e => set('areaTotal', Number(e.target.value))} required min={1} />
          </div>
          <div>
            <label className={labelCls}>Área útil (m²)</label>
            <input type="number" className={inputCls} value={form.areaUtil ?? ''} onChange={e => set('areaUtil', Number(e.target.value))} min={0} />
          </div>
          <div>
            <label className={labelCls}>Dormitórios *</label>
            <input type="number" className={inputCls} value={form.quartos ?? 1} onChange={e => set('quartos', Number(e.target.value))} required min={0} max={20} />
          </div>
          <div>
            <label className={labelCls}>Banheiros *</label>
            <input type="number" className={inputCls} value={form.banheiros ?? 1} onChange={e => set('banheiros', Number(e.target.value))} required min={1} max={20} />
          </div>
          <div>
            <label className={labelCls}>Vagas *</label>
            <input type="number" className={inputCls} value={form.vagas ?? 0} onChange={e => set('vagas', Number(e.target.value))} required min={0} max={20} />
          </div>
          <div>
            <label className={labelCls}>Suítes</label>
            <input type="number" className={inputCls} value={form.suites ?? 0} onChange={e => set('suites', Number(e.target.value))} min={0} max={20} />
          </div>
          <div>
            <label className={labelCls}>Andar da unidade</label>
            <input type="number" className={inputCls} value={form.andarUnidade ?? ''} onChange={e => set('andarUnidade', e.target.value ? Number(e.target.value) : undefined)} min={1} />
          </div>
          <div>
            <label className={labelCls}>Total de andares</label>
            <input type="number" className={inputCls} value={form.totalAndares ?? ''} onChange={e => set('totalAndares', e.target.value ? Number(e.target.value) : undefined)} min={1} />
          </div>
        </div>
      </div>

      {/* Diferenciais */}
      <div className={sectionCls}>
        <h2 className="text-lg font-light mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Diferenciais</h2>
        <div className="flex gap-2 mb-4">
          <input
            className={`${inputCls} flex-1`}
            value={diferencial}
            onChange={e => setDiferencial(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), adicionarDiferencial())}
            placeholder="Ex: Varanda gourmet, A 300m do metrô..."
          />
          <button
            type="button"
            onClick={adicionarDiferencial}
            className="bg-[var(--color-gold)] text-white px-4 py-2.5 text-xs tracking-widest uppercase hover:bg-[var(--color-dark)] transition-colors"
          >
            Adicionar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(form.diferenciais ?? []).map(item => (
            <span key={item} className="flex items-center gap-1.5 bg-[var(--color-warm-gray)] border border-[var(--color-border)] text-xs px-3 py-1.5">
              {item}
              <button type="button" onClick={() => removerDiferencial(item)} className="text-gray-400 hover:text-red-500 ml-1">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Fotos */}
      <div className={sectionCls}>
        <h2 className="text-lg font-light mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Fotos</h2>
        <p className="text-xs text-gray-400 mb-6">Clique na estrela (★) para definir a foto de capa</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {(form.imagens ?? []).map(img => (
            <div key={img.id} className="relative group aspect-[4/3] bg-[var(--color-warm-gray)] overflow-hidden border border-[var(--color-border)]">
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                <div className="absolute top-1 left-1">
                  <button
                    type="button"
                    onClick={() => setDestaque(img.id)}
                    className={`text-lg leading-none ${img.destaque ? 'text-[var(--color-gold)]' : 'text-white/60 hover:text-white'}`}
                    title="Definir como capa"
                  >
                    ★
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removerImagem(img.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
              {img.destaque && (
                <span className="absolute bottom-1 left-1 bg-[var(--color-gold)] text-white text-[9px] px-1.5 py-0.5 tracking-widest">CAPA</span>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="aspect-[4/3] border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)] flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[var(--color-gold)] transition-colors disabled:opacity-50"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs">{uploading ? 'Enviando...' : 'Adicionar fotos'}</span>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFotos} />
      </div>

      {/* Plantas Baixas */}
      <div className={sectionCls}>
        <h2 className="text-lg font-light mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Plantas Baixas</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {(form.plantasBaixas ?? []).map(planta => (
            <div key={planta.id} className="relative group">
              <div className="aspect-[4/3] bg-[var(--color-warm-gray)] overflow-hidden border border-[var(--color-border)]">
                <img src={planta.imagemUrl} alt={planta.titulo} className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => removerPlanta(planta.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">{planta.titulo}</p>
              <span className={`text-[9px] tracking-widest uppercase px-1.5 py-0.5 ${
                planta.tipo === 'unidade' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-600'
              }`}>
                {planta.tipo}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              plantaRef.current?.setAttribute('data-tipo', 'unidade')
              plantaRef.current?.click()
            }}
            disabled={uploading}
            className="flex-1 border border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)] py-3 text-xs text-gray-400 hover:text-[var(--color-gold)] transition-colors disabled:opacity-50"
          >
            + Planta do Apartamento
          </button>
          <button
            type="button"
            onClick={() => {
              plantaRef.current?.setAttribute('data-tipo', 'edificio')
              plantaRef.current?.click()
            }}
            disabled={uploading}
            className="flex-1 border border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)] py-3 text-xs text-gray-400 hover:text-[var(--color-gold)] transition-colors disabled:opacity-50"
          >
            + Planta do Edifício
          </button>
        </div>
        <input
          ref={plantaRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handlePlanta(e, (plantaRef.current?.getAttribute('data-tipo') as 'unidade' | 'edificio') ?? 'unidade')}
        />
      </div>

      {/* Endereço */}
      <div className={sectionCls}>
        <h2 className="text-lg font-light mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Endereço</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Rua / Avenida *</label>
            <input className={inputCls} value={form.endereco?.rua ?? ''} onChange={e => set('endereco.rua', e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Número *</label>
            <input className={inputCls} value={form.endereco?.numero ?? ''} onChange={e => set('endereco.numero', e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Complemento</label>
            <input className={inputCls} value={form.endereco?.complemento ?? ''} onChange={e => set('endereco.complemento', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Bairro *</label>
            <input className={inputCls} value={form.endereco?.bairro ?? ''} onChange={e => set('endereco.bairro', e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>CEP</label>
            <input className={inputCls} value={form.endereco?.cep ?? ''} onChange={e => set('endereco.cep', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-gold)] text-white px-8 py-3.5 text-xs tracking-widest uppercase font-medium hover:bg-[var(--color-dark)] transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Imóvel'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/imoveis')}
            className="border border-[var(--color-border)] text-gray-500 px-8 py-3.5 text-xs tracking-widest uppercase hover:border-[var(--color-dark)] hover:text-[var(--color-dark)] transition-colors"
          >
            Cancelar
          </button>
        </div>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-600 text-xs tracking-widest uppercase transition-colors"
          >
            Excluir Imóvel
          </button>
        )}
      </div>

      {msg && (
        <p className={`mt-4 text-sm ${msg.includes('Erro') ? 'text-red-500' : 'text-green-600'}`}>
          {msg}
        </p>
      )}
    </form>
  )
}
