'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminNav() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-dark)] h-16 flex items-center px-6">
      <Link href="/admin" className="flex flex-col leading-none mr-8">
        <span
          className="text-lg font-light tracking-widest text-white"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          BARONE
        </span>
        <span className="text-[8px] tracking-[0.35em] text-[var(--color-gold)] uppercase">Admin</span>
      </Link>

      <div className="flex items-center gap-6 flex-1">
        <Link
          href="/admin"
          className="text-xs tracking-wide text-gray-400 hover:text-white transition-colors uppercase"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/imoveis"
          className="text-xs tracking-wide text-gray-400 hover:text-white transition-colors uppercase"
        >
          Imóveis
        </Link>
        <Link
          href="/admin/imoveis/novo"
          className="text-xs tracking-wide text-[var(--color-gold)] hover:text-white transition-colors uppercase"
        >
          + Novo Imóvel
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="text-xs tracking-wide text-gray-500 hover:text-gray-300 transition-colors"
        >
          Ver site
        </Link>
        <button
          onClick={handleLogout}
          className="text-xs tracking-wide text-gray-500 hover:text-red-400 transition-colors uppercase"
        >
          Sair
        </button>
      </div>
    </nav>
  )
}
