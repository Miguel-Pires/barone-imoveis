import Link from 'next/link'
import { getImoveis } from '@/lib/db'
import AdminListaImoveis from '@/components/admin/AdminListaImoveis'

export const dynamic = 'force-dynamic'

export default async function AdminImoveisPage() {
  const imoveis = await getImoveis(false)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-10">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl font-light text-[var(--color-dark)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Imóveis
          </h1>
          <p className="text-sm text-gray-400 mt-1">{imoveis.length} imóvel(is) cadastrado(s)</p>
        </div>
        <Link
          href="/admin/imoveis/novo"
          className="bg-[var(--color-gold)] text-white text-xs tracking-widest uppercase px-5 py-3 hover:bg-[var(--color-dark)] transition-colors"
        >
          + Novo Imóvel
        </Link>
      </div>

      {imoveis.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] py-20 text-center">
          <p className="text-gray-400 mb-6">Nenhum imóvel cadastrado.</p>
          <Link href="/admin/imoveis/novo" className="inline-block bg-[var(--color-gold)] text-white text-xs tracking-widest uppercase px-6 py-3">
            Cadastrar primeiro imóvel
          </Link>
        </div>
      ) : (
        <AdminListaImoveis imoveis={imoveis} />
      )}
    </div>
  )
}
