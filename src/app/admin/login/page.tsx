'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: senha }),
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setErro('Senha incorreta.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-dark)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span
            className="block text-3xl font-light tracking-widest text-white mb-1"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            BARONE
          </span>
          <span className="block text-[9px] tracking-[0.4em] text-[var(--color-gold)] uppercase">
            Painel Administrativo
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs tracking-widest uppercase text-gray-400 mb-2">
              Senha de acesso
            </label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="w-full bg-[#2C2C2C] text-white border border-gray-700 focus:border-[var(--color-gold)] outline-none px-4 py-3 text-sm transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {erro && (
            <p className="text-red-400 text-xs">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-gold)] text-white py-3.5 text-xs tracking-widest uppercase font-medium hover:bg-white hover:text-[var(--color-dark)] transition-all disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600 text-xs">
          <a href="/" className="hover:text-gray-400 transition-colors">← Voltar ao site</a>
        </p>
      </div>
    </div>
  )
}
