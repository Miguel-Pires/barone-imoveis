import Link from 'next/link'
import { getImoveis, formatPreco } from '@/lib/db'

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

      <div className="bg-white border border-[var(--color-border)] overflow-hidden">
        {imoveis.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 mb-6">Nenhum imóvel cadastrado.</p>
            <Link href="/admin/imoveis/novo" className="inline-block bg-[var(--color-gold)] text-white text-xs tracking-widest uppercase px-6 py-3">
              Cadastrar primeiro imóvel
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {imoveis.map(imovel => (
              <Link
                key={imovel.id}
                href={`/admin/imoveis/${imovel.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="w-16 h-12 bg-[var(--color-warm-gray)] shrink-0 overflow-hidden">
                  {imovel.imagens[0] ? (
                    <img src={imovel.imagens[0].url} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-dark)] text-sm truncate">{imovel.titulo}</p>
                  <p className="text-xs text-gray-400 truncate">{imovel.endereco.bairro} · {imovel.tipo} · {imovel.areaTotal}m²</p>
                  <p className="text-xs text-gray-400 md:hidden">{formatPreco(imovel.preco)}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${
                    imovel.statusAnuncio === 'ativo' ? 'bg-green-50 text-green-600' :
                    imovel.statusAnuncio === 'vendido' ? 'bg-amber-50 text-amber-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {imovel.statusAnuncio}
                  </span>
                  <span className="text-xs text-[var(--color-gold)]">Editar →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
