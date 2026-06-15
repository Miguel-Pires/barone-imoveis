import Link from 'next/link'
import Image from 'next/image'
import { Imovel } from '@/types/imovel'
import { formatPreco } from '@/lib/format'

const STATUS_LABEL: Record<string, string> = {
  lancamento: 'Lançamento',
  em_construcao: 'Em Construção',
  pronto: 'Pronto para Morar',
  usado: 'Revenda',
}

const TIPO_LABEL: Record<string, string> = {
  apartamento: 'Apartamento',
  cobertura: 'Cobertura',
  studio: 'Studio',
  loft: 'Loft',
  penthouse: 'Penthouse',
}

interface Props {
  imovel: Imovel
}

export default function ImovelCard({ imovel }: Props) {
  const imagemCapa = imovel.imagens.find(i => i.destaque) ?? imovel.imagens[0]

  return (
    <Link href={`/imoveis/${imovel.slug}`} className="group block">
      <article className="bg-white border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all duration-300 overflow-hidden">
        <div className="relative overflow-hidden aspect-[4/3] bg-[var(--color-warm-gray)]">
          {imagemCapa ? (
            <Image
              src={imagemCapa.url}
              alt={imagemCapa.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={70}
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-[var(--color-dark)]/80 text-white text-[10px] tracking-widest uppercase px-2.5 py-1 backdrop-blur-sm">
              {STATUS_LABEL[imovel.status] ?? imovel.status}
            </span>
          </div>
          {imovel.destaque && (
            <div className="absolute top-3 right-3">
              <span className="bg-[var(--color-gold)] text-white text-[10px] tracking-widest uppercase px-2.5 py-1">
                Destaque
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-[10px] tracking-[0.2em] text-[var(--color-gold)] uppercase font-medium">
              {TIPO_LABEL[imovel.tipo]}{imovel.endereco.bairro ? ` · ${imovel.endereco.bairro}` : ''}
            </p>
          </div>

          <h3
            className="text-xl font-light text-[var(--color-dark)] mb-3 group-hover:text-[var(--color-gold)] transition-colors leading-snug"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {imovel.titulo}
          </h3>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 border-t border-[var(--color-border)] pt-4">
            {imovel.quartos != null && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {imovel.quartos} {imovel.quartos === 1 ? 'dorm.' : 'dorms.'}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              {imovel.vagas} vaga{imovel.vagas !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {imovel.areaTotal}m²
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">A partir de</p>
              <p
                className="text-xl font-light text-[var(--color-dark)] lining-nums tabular-nums"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {formatPreco(imovel.preco)}
              </p>
            </div>
            <span className="text-[10px] tracking-widest uppercase text-[var(--color-gold)] flex items-center gap-1 group-hover:gap-2 transition-all">
              Ver mais
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
