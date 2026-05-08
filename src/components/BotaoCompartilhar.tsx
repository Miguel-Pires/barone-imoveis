'use client'

import { useState, useRef, useEffect } from 'react'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.imoveisbarone.com'

interface Props {
  titulo: string
  bairro: string
  preco: string
  area: number
  quartos: number
  banheiros: number
  url: string
}

export default function BotaoCompartilhar({ titulo, bairro, preco, area, quartos, banheiros, url }: Props) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const mensagem =
    `Olá! Vi esse imóvel pela Barone Imóveis e pensei em você.\n\n` +
    `*${titulo}*\n` +
    `${bairro}, São Paulo\n` +
    `Valor: ${preco}\n` +
    `${area}m² · ${quartos} dorm${quartos !== 1 ? 's' : ''} · ${banheiros} banh${banheiros !== 1 ? 's' : ''}\n\n` +
    `Veja todos os detalhes:\n${url}\n\n` +
    `_Barone Imóveis — Alto padrão no centro de SP_`

  const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  async function handleClick() {
    // Só usa native share no mobile — no desktop o share não envia o texto corretamente
    if (isMobile && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Barone Imóveis', text: mensagem, url: SITE })
        return
      } catch {}
    }
    setOpen(prev => !prev)
  }

  async function copiar(texto: string, label: string) {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = texto
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setFeedback(label)
    setTimeout(() => { setFeedback(''); setOpen(false) }, 1600)
  }

  const waUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`

  return (
    <div ref={ref} className="relative mt-3">
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 border border-[var(--color-border)] text-gray-500 py-3.5 text-xs tracking-widest uppercase hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
        Compartilhar
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white border border-[var(--color-border)] shadow-xl z-30 overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-warm-gray)]">
            <p className="text-[10px] tracking-widest uppercase text-gray-400">Compartilhar imóvel</p>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 text-sm text-[var(--color-dark)] hover:bg-[var(--color-warm-gray)] transition-colors border-b border-[var(--color-border)]"
          >
            <span className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </span>
            <div>
              <p className="font-medium text-[var(--color-dark)] text-sm">Enviar pelo WhatsApp</p>
              <p className="text-xs text-gray-400">Abre com mensagem pronta</p>
            </div>
          </a>

          <button
            onClick={() => copiar(mensagem, 'Mensagem copiada!')}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-[var(--color-dark)] hover:bg-[var(--color-warm-gray)] transition-colors border-b border-[var(--color-border)] text-left"
          >
            <span className="w-8 h-8 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </span>
            <div>
              <p className="font-medium text-[var(--color-dark)] text-sm">Copiar mensagem</p>
              <p className="text-xs text-gray-400">Texto formatado com detalhes</p>
            </div>
          </button>

          <button
            onClick={() => copiar(url, 'Link copiado!')}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-[var(--color-dark)] hover:bg-[var(--color-warm-gray)] transition-colors text-left"
          >
            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </span>
            <div>
              <p className="font-medium text-[var(--color-dark)] text-sm">Copiar link</p>
              <p className="text-xs text-gray-400">Só o endereço da página</p>
            </div>
          </button>

          {feedback && (
            <div className="flex items-center justify-center gap-2 py-2.5 bg-[var(--color-gold)]/10 border-t border-[var(--color-border)]">
              <svg className="w-4 h-4 text-[var(--color-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-xs text-[var(--color-gold)] font-medium tracking-wide">{feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
