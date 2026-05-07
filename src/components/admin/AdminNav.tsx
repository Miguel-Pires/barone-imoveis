'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminNav() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', gold: false },
    { href: '/admin/imoveis', label: 'Imóveis', gold: false },
    { href: '/admin/imoveis/novo', label: '+ Novo Imóvel', gold: true },
    { href: '/admin/perfil', label: 'Meu Perfil', gold: false },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-dark)] h-16 flex items-center px-4 md:px-6">
        <Link href="/admin" className="flex flex-col leading-none mr-auto md:mr-8" onClick={() => setOpen(false)}>
          <span
            className="text-lg font-light tracking-widest text-white"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            BARONE
          </span>
          <span className="text-[8px] tracking-[0.35em] text-[var(--color-gold)] uppercase">Admin</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs tracking-wide hover:text-white transition-colors uppercase ${link.gold ? 'text-[var(--color-gold)]' : 'text-gray-400'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/" target="_blank" className="text-xs tracking-wide text-gray-500 hover:text-gray-300 transition-colors">
            Ver site
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs tracking-wide text-gray-500 hover:text-red-400 transition-colors uppercase"
          >
            Sair
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span className={`block w-5 h-px bg-white transition-all origin-center ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-all ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-all origin-center ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-[var(--color-dark)] border-t border-white/10 md:hidden shadow-xl">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center px-6 py-4 text-sm tracking-wide uppercase border-b border-white/5 active:bg-white/5 ${link.gold ? 'text-[var(--color-gold)]' : 'text-gray-300'}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            target="_blank"
            onClick={() => setOpen(false)}
            className="flex items-center px-6 py-4 text-sm text-gray-500 border-b border-white/5 active:bg-white/5"
          >
            Ver site →
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-6 py-4 text-sm text-red-400 tracking-wide uppercase active:bg-white/5"
          >
            Sair
          </button>
        </div>
      )}
    </>
  )
}
