'use client'

import { useState, useEffect, useRef } from 'react'
import { CorretorPerfil } from '@/types/imovel'

const EMPTY: CorretorPerfil = {
  nome: '',
  creci: '',
  especialidade: '',
  bio: '',
  bio2: '',
  fotoPerfil: '',
  fotoCapa: '',
  whatsapp: '',
  email: '',
}

export default function AdminPerfilPage() {
  const [form, setForm] = useState<CorretorPerfil>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const perfilRef = useRef<HTMLInputElement>(null)
  const capaRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/perfil')
      .then(r => r.json())
      .then(data => { setForm({ ...EMPTY, ...data }); setLoading(false) })
  }, [])

  async function uploadImagem(file: File, campo: 'fotoPerfil' | 'fotoCapa') {
    setUploading(campo)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      setForm(prev => ({ ...prev, [campo]: url }))
    }
    setUploading(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setMsg(res.ok ? 'Perfil salvo com sucesso!' : 'Erro ao salvar.')
    setSaving(false)
  }

  const inputCls = 'w-full border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm focus:border-[var(--color-gold)] outline-none transition-colors'
  const labelCls = 'block text-[10px] tracking-widest uppercase text-gray-400 mb-1.5'
  const sectionCls = 'bg-white border border-[var(--color-border)] p-4 md:p-6 mb-4 md:mb-6'

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-12">
        <p className="text-gray-400 text-sm">Carregando perfil...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-12">
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.25em] text-[var(--color-gold)] uppercase mb-2">Configurações</p>
        <h1 className="text-3xl font-light text-[var(--color-dark)]" style={{ fontFamily: 'var(--font-serif)' }}>
          Meu Perfil
        </h1>
      </div>

      <form onSubmit={handleSave}>
        {/* Fotos */}
        <div className={sectionCls}>
          <h2 className="text-lg font-light mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Fotos</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Foto de perfil */}
            <div>
              <label className={labelCls}>Foto de Perfil</label>
              <div
                className="relative group cursor-pointer border border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)] transition-colors overflow-hidden"
                style={{ aspectRatio: '1/1', maxWidth: 180 }}
                onClick={() => perfilRef.current?.click()}
              >
                {form.fotoPerfil ? (
                  <>
                    <img src={form.fotoPerfil} alt="Foto de perfil" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-xs tracking-widest uppercase transition-opacity">
                        {uploading === 'fotoPerfil' ? 'Enviando...' : 'Alterar'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[var(--color-gold)] transition-colors">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs">{uploading === 'fotoPerfil' ? 'Enviando...' : 'Adicionar foto'}</span>
                  </div>
                )}
              </div>
              <input
                ref={perfilRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImagem(f, 'fotoPerfil'); e.target.value = '' }}
              />
            </div>

            {/* Foto de capa */}
            <div>
              <label className={labelCls}>Foto de Capa</label>
              <div
                className="relative group cursor-pointer border border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)] transition-colors overflow-hidden"
                style={{ aspectRatio: '16/9', maxWidth: 320 }}
                onClick={() => capaRef.current?.click()}
              >
                {form.fotoCapa ? (
                  <>
                    <img src={form.fotoCapa} alt="Foto de capa" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-xs tracking-widest uppercase transition-opacity">
                        {uploading === 'fotoCapa' ? 'Enviando...' : 'Alterar'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-[var(--color-gold)] transition-colors">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">{uploading === 'fotoCapa' ? 'Enviando...' : 'Adicionar capa'}</span>
                  </div>
                )}
              </div>
              <input
                ref={capaRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImagem(f, 'fotoCapa'); e.target.value = '' }}
              />
            </div>
          </div>
        </div>

        {/* Informações */}
        <div className={sectionCls}>
          <h2 className="text-lg font-light mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Informações</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nome *</label>
                <input
                  className={inputCls}
                  value={form.nome}
                  onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>CRECI</label>
                <input
                  className={inputCls}
                  value={form.creci ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, creci: e.target.value }))}
                  placeholder="Ex: 123456-F"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Especialidade / Cargo</label>
              <input
                className={inputCls}
                value={form.especialidade ?? ''}
                onChange={e => setForm(prev => ({ ...prev, especialidade: e.target.value }))}
                placeholder="Ex: Especialista Centro SP"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>WhatsApp *</label>
                <input
                  className={inputCls}
                  value={form.whatsapp}
                  onChange={e => setForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="5511940726116"
                  required
                />
              </div>
              <div>
                <label className={labelCls}>E-mail</label>
                <input
                  type="email"
                  className={inputCls}
                  value={form.email ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sobre (texto) */}
        <div className={sectionCls}>
          <h2 className="text-lg font-light mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Texto "Sobre"</h2>
          <p className="text-xs text-gray-400 mb-4">Aparece na seção "Sobre" da página inicial.</p>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Parágrafo 1</label>
              <textarea
                className={`${inputCls} min-h-[100px] resize-y`}
                value={form.bio ?? ''}
                onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Descreva sua experiência e especialização..."
              />
            </div>
            <div>
              <label className={labelCls}>Parágrafo 2</label>
              <textarea
                className={`${inputCls} min-h-[100px] resize-y`}
                value={form.bio2 ?? ''}
                onChange={e => setForm(prev => ({ ...prev, bio2: e.target.value }))}
                placeholder="Complemente com mais informações..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--color-gold)] text-white px-8 py-3.5 text-xs tracking-widest uppercase font-medium hover:bg-[var(--color-dark)] transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </button>
          {msg && (
            <p className={`text-sm ${msg.includes('Erro') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>
          )}
        </div>
      </form>
    </div>
  )
}
