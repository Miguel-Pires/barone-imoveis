import { notFound } from 'next/navigation'
import { getImovelById } from '@/lib/db'
import ImovelForm from '@/components/admin/ImovelForm'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function EditarImovelPage({ params }: Props) {
  const { id } = await params
  const imovel = await getImovelById(id)
  if (!imovel) notFound()

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-[var(--color-dark)]" style={{ fontFamily: 'var(--font-serif)' }}>
            {imovel.titulo}
          </h1>
          <p className="text-sm text-gray-400 mt-1">Editar informações do imóvel</p>
        </div>
        <Link
          href={`/imoveis/${imovel.slug}`}
          target="_blank"
          className="text-xs text-[var(--color-gold)] hover:text-[var(--color-dark)] transition-colors"
        >
          Ver no site ↗
        </Link>
      </div>
      <ImovelForm imovel={imovel} />
    </div>
  )
}
