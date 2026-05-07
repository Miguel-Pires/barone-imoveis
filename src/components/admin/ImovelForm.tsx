'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Imovel, Imagem, PlantaBaixa, Video } from '@/types/imovel'
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
  videos: [],
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
  const [dragging, setDragging] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoError, setVideoError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const plantaUnidadeRef = useRef<HTMLInputElement>(null)
  const plantaEdificioRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

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

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length > 0) {
      setUploading(true)
      const novas: Imagem[] = []
      const ordem = form.imagens?.length ?? 0
      for (const file of files) {
        const url = await uploadFoto(file)
        if (url) novas.push({ id: uuidv4(), url, alt: file.name.replace(/\.[^.]+$/, ''), ordem: ordem + novas.length })
      }
      setForm(prev => ({ ...prev, imagens: [...(prev.imagens ?? []), ...novas] }))
      setUploading(false)
      return
    }

    // Imagens arrastadas do navegador (URL)
    const rawUrls = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain')
    if (rawUrls) {
      const urls = rawUrls.split(/\r?\n/).map(u => u.trim()).filter(u => u && !u.startsWith('#') && /^https?:\/\//i.test(u))
      if (urls.length > 0) {
        setUploading(true)
        const novas: Imagem[] = []
        const ordem = form.imagens?.length ?? 0
        for (const srcUrl of urls) {
          const res = await fetch('/api/upload-from-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: srcUrl }),
          })
          if (res.ok) {
            const { url } = await res.json()
            novas.push({ id: uuidv4(), url, alt: '', ordem: ordem + novas.length })
          }
        }
        setForm(prev => ({ ...prev, imagens: [...(prev.imagens ?? []), ...novas] }))
        setUploading(false)
      }
    }
  }

  async function handlePlanta(e: React.ChangeEvent<HTMLInputElement>, tipo: 'unidade' | 'edificio') {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
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
    }
    setUploading(false)
    e.target.value = ''
  }

  function updatePlanta(id: string, field: keyof PlantaBaixa, value: unknown) {
    setForm(prev => ({
      ...prev,
      plantasBaixas: (prev.plantasBaixas ?? []).map(p => p.id === id ? { ...p, [field]: value } : p),
    }))
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

  function parseVideoUrl(url: string): Pick<Video, 'tipo' | 'embedId'> | null {
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (yt) return { tipo: 'youtube', embedId: yt[1] }
    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    if (vimeo) return { tipo: 'vimeo', embedId: vimeo[1] }
    return null
  }

  function adicionarVideoUrl() {
    setVideoError('')
    const parsed = parseVideoUrl(videoUrl.trim())
    if (!parsed) { setVideoError('URL inválida. Use um link do YouTube ou Vimeo.'); return }
    const nova: Video = { id: uuidv4(), tipo: parsed.tipo, url: videoUrl.trim(), embedId: parsed.embedId }
    setForm(prev => ({ ...prev, videos: [...(prev.videos ?? []), nova] }))
    setVideoUrl('')
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setVideoError('')
    const url = await uploadFoto(file)
    if (url) {
      const novo: Video = { id: uuidv4(), tipo: 'upload', url }
      setForm(prev => ({ ...prev, videos: [...(prev.videos ?? []), novo] }))
    } else {
      setVideoError('Erro ao enviar vídeo. Tente novamente.')
    }
    setUploading(false)
    e.target.value = ''
  }

  function updateVideo(id: string, field: keyof Video, value: unknown) {
    setForm(prev => ({
      ...prev,
      videos: (prev.videos ?? []).map(v => v.id === id ? { ...v, [field]: value } : v),
    }))
  }

  function removerVideo(id: string) {
    setForm(prev => ({ ...prev, videos: (prev.videos ?? []).filter(v => v.id !== id) }))
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
  const sectionCls = 'bg-white border border-[var(--color-border)] p-4 md:p-6 mb-4 md:mb-6'

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
        <p className="text-xs text-gray-400 mb-4">Arraste fotos aqui, cole do navegador ou clique em "+" para selecionar. Toque na estrela (★) para definir a capa.</p>

        <div
          className={`relative rounded-sm transition-colors ${dragging ? 'bg-[var(--color-gold)]/5 ring-2 ring-[var(--color-gold)]' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragEnter={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false) }}
          onDrop={handleDrop}
        >
          {dragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-gold)]/10 pointer-events-none">
              <div className="flex flex-col items-center gap-2 text-[var(--color-gold)]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm font-medium tracking-widest uppercase">Solte aqui</span>
              </div>
            </div>
          )}

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
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFotos} />
      </div>

      {/* Plantas Baixas */}
      <div className={sectionCls}>
        <h2 className="text-lg font-light mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Plantas Baixas</h2>
        <p className="text-xs text-gray-400 mb-6">Você pode adicionar múltiplas variações (tipos A, B, C ou por metragem). Edite o título, tipologia e área após o upload.</p>

        {/* Lista de plantas com edição inline */}
        {(form.plantasBaixas ?? []).length > 0 && (
          <div className="space-y-4 mb-6">
            {(form.plantasBaixas ?? []).map(planta => (
              <div key={planta.id} className="border border-[var(--color-border)] p-4 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 items-start">
                {/* Thumbnail */}
                <div className="relative group aspect-[4/3] sm:aspect-[4/3] bg-[var(--color-warm-gray)] overflow-hidden sm:w-auto w-full max-h-40 sm:max-h-none">
                  <img src={planta.imagemUrl} alt={planta.titulo} className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => removerPlanta(planta.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>

                {/* Campos editáveis */}
                <div className="space-y-2">
                  <div>
                    <label className={labelCls}>Título / Nome</label>
                    <input
                      className={inputCls}
                      value={planta.titulo}
                      onChange={e => updatePlanta(planta.id, 'titulo', e.target.value)}
                      placeholder="Ex: Tipo A, Planta 84m²..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Tipologia</label>
                      <input
                        className={inputCls}
                        value={planta.tipologia}
                        onChange={e => updatePlanta(planta.id, 'tipologia', e.target.value)}
                        placeholder="Ex: 3 dorms, Studio..."
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Área (m²)</label>
                      <input
                        type="number"
                        className={inputCls}
                        value={planta.areaTotal || ''}
                        onChange={e => updatePlanta(planta.id, 'areaTotal', Number(e.target.value))}
                        min={0}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Tipo</label>
                      <select
                        className={inputCls}
                        value={planta.tipo}
                        onChange={e => updatePlanta(planta.id, 'tipo', e.target.value)}
                      >
                        <option value="unidade">Apartamento / Unidade</option>
                        <option value="edificio">Edifício / Implantação</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Preço (R$)</label>
                      <input
                        type="number"
                        className={inputCls}
                        value={planta.preco ?? ''}
                        onChange={e => updatePlanta(planta.id, 'preco', e.target.value ? Number(e.target.value) : undefined)}
                        min={0}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Descrição (opcional)</label>
                    <input
                      className={inputCls}
                      value={planta.descricao ?? ''}
                      onChange={e => updatePlanta(planta.id, 'descricao', e.target.value)}
                      placeholder="Detalhe extra..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botões de upload */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => plantaUnidadeRef.current?.click()}
            disabled={uploading}
            className="flex-1 border border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)] py-3 text-xs text-gray-400 hover:text-[var(--color-gold)] transition-colors disabled:opacity-50"
          >
            {uploading ? 'Enviando...' : '+ Planta do Apartamento'}
          </button>
          <button
            type="button"
            onClick={() => plantaEdificioRef.current?.click()}
            disabled={uploading}
            className="flex-1 border border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)] py-3 text-xs text-gray-400 hover:text-[var(--color-gold)] transition-colors disabled:opacity-50"
          >
            {uploading ? 'Enviando...' : '+ Planta do Edifício'}
          </button>
        </div>
        <input ref={plantaUnidadeRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handlePlanta(e, 'unidade')} />
        <input ref={plantaEdificioRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handlePlanta(e, 'edificio')} />
      </div>

      {/* Vídeos */}
      <div className={sectionCls}>
        <h2 className="text-lg font-light mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Vídeos</h2>
        <p className="text-xs text-gray-400 mb-6">Cole um link do YouTube ou Vimeo, ou faça upload de um vídeo (MP4, MOV, WEBM).</p>

        {(form.videos ?? []).length > 0 && (
          <div className="space-y-3 mb-6">
            {(form.videos ?? []).map(video => (
              <div key={video.id} className="border border-[var(--color-border)] p-3 flex gap-3 items-start">
                <div className="w-24 h-14 bg-[var(--color-dark)] shrink-0 overflow-hidden relative">
                  {video.tipo === 'youtube' && video.embedId ? (
                    <img src={`https://img.youtube.com/vi/${video.embedId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                  ) : video.tipo === 'upload' ? (
                    <video src={video.url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[10px] text-[#1AB7EA] tracking-widest">VIMEO</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                      <svg className="w-3 h-3 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <input
                    className={inputCls}
                    value={video.titulo ?? ''}
                    onChange={e => updateVideo(video.id, 'titulo', e.target.value)}
                    placeholder="Título do vídeo (opcional)"
                  />
                  <p className="text-[10px] text-gray-400 truncate">
                    {video.tipo === 'youtube' ? 'YouTube' : video.tipo === 'vimeo' ? 'Vimeo' : 'Upload'} · {video.embedId ?? video.url}
                  </p>
                </div>
                <button type="button" onClick={() => removerVideo(video.id)} className="text-gray-400 hover:text-red-500 transition-colors text-xl shrink-0 leading-none">×</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <input
            className={`${inputCls} flex-1`}
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), adicionarVideoUrl())}
            placeholder="Cole link do YouTube ou Vimeo..."
          />
          <button
            type="button"
            onClick={adicionarVideoUrl}
            className="bg-[var(--color-gold)] text-white px-4 py-2.5 text-xs tracking-widest uppercase hover:bg-[var(--color-dark)] transition-colors shrink-0"
          >
            Adicionar
          </button>
        </div>
        <button
          type="button"
          onClick={() => videoRef.current?.click()}
          disabled={uploading}
          className="w-full border border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)] py-3 text-xs text-gray-400 hover:text-[var(--color-gold)] transition-colors disabled:opacity-50"
        >
          {uploading ? 'Enviando...' : '+ Upload de vídeo (MP4, MOV, WEBM — máx 200MB)'}
        </button>
        <input ref={videoRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleVideoUpload} />
        {videoError && <p className="text-xs text-red-500 mt-2">{videoError}</p>}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-gold)] text-white px-8 py-4 text-xs tracking-widest uppercase font-medium hover:bg-[var(--color-dark)] transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Imóvel'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/imoveis')}
            className="border border-[var(--color-border)] text-gray-500 px-8 py-4 text-xs tracking-widest uppercase hover:border-[var(--color-dark)] hover:text-[var(--color-dark)] transition-colors"
          >
            Cancelar
          </button>
        </div>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-600 text-xs tracking-widest uppercase transition-colors py-2"
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
