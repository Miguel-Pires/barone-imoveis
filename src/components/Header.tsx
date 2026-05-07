'use client'

import Link from 'next/link'
import { useState } from 'react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '5511940726116'
const MSG = encodeURIComponent('Olá, gostaria de mais informações sobre os imóveis disponíveis.')

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex flex-col leading-none group">
          <span
            className="text-2xl font-light tracking-widest text-[var(--color-dark)] group-hover:text-[var(--color-gold)] transition-colors"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            BARONE
          </span>
          <span className="text-[9px] tracking-[0.3em] text-[var(--color-gold)] font-medium uppercase">
            Imóveis
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#imoveis" className="text-sm tracking-wide text-gray-600 hover:text-[var(--color-gold)] transition-colors">
            Imóveis
          </Link>
          <Link href="/#sobre" className="text-sm tracking-wide text-gray-600 hover:text-[var(--color-gold)] transition-colors">
            Sobre
          </Link>
          <Link href="/#contato" className="text-sm tracking-wide text-gray-600 hover:text-[var(--color-gold)] transition-colors">
            Contato
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-gold)] text-white text-xs tracking-widest font-medium uppercase px-5 py-2.5 hover:bg-[var(--color-dark)] transition-colors"
          >
            WhatsApp
          </a>
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`block h-px bg-[var(--color-dark)] transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-px bg-[var(--color-dark)] transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px bg-[var(--color-dark)] transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[var(--color-border)] px-6 py-4 flex flex-col gap-4">
          <Link href="/#imoveis" className="text-sm tracking-wide text-gray-600" onClick={() => setMenuOpen(false)}>Imóveis</Link>
          <Link href="/#sobre" className="text-sm tracking-wide text-gray-600" onClick={() => setMenuOpen(false)}>Sobre</Link>
          <Link href="/#contato" className="text-sm tracking-wide text-gray-600" onClick={() => setMenuOpen(false)}>Contato</Link>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--color-gold)] text-white text-xs tracking-widest font-medium uppercase px-5 py-3 text-center"
          >
            Fale pelo WhatsApp
          </a>
        </div>
      )}
    </header>
  )
}
