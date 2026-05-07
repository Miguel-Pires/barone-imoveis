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
      <Link href="/admin" className="flex items-center gap-2.5 mr-8">
        <svg viewBox="0 0 100 100" className="w-8 h-8 shrink-0" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="3" fill="#B8975A"/>
          <rect x="17" y="13" width="66" height="1.5" fill="#1A1A1A" opacity="0.4"/>
          <rect x="17" y="85.5" width="66" height="1.5" fill="#1A1A1A" opacity="0.4"/>
          <rect x="21" y="20" width="10" height="60" fill="#1A1A1A"/>
          <path d="M31 20 H55 Q73 20 73 36 Q73 52 55 52 H31 Z" fill="#1A1A1A"/>
          <path d="M39 28 H53 Q64 28 64 36 Q64 44 53 44 H39 Z" fill="#B8975A"/>
          <path d="M31 52 H57 Q79 52 79 66 Q79 80 57 80 H31 Z" fill="#1A1A1A"/>
          <path d="M39 60 H55 Q70 60 70 66 Q70 72 55 72 H39 Z" fill="#B8975A"/>
        </svg>
        <div className="flex flex-col leading-none">
          <span className="text-base font-light tracking-widest text-white" style={{ fontFamily: 'var(--font-serif)' }}>
            BARONE
          </span>
          <span className="text-[8px] tracking-[0.35em] text-[var(--color-gold)] uppercase">Admin</span>
        </div>
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
        <Link
          href="/admin/perfil"
          className="text-xs tracking-wide text-gray-400 hover:text-white transition-colors uppercase"
        >
          Meu Perfil
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
