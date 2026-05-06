import Link from 'next/link'
import { getImoveis, formatPreco } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminImoveisPage() {
  const imoveis = await getImoveis(false)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
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
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-warm-gray)] border-b border-[var(--color-border)]">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-gray-500 font-medium">Imóvel</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-gray-500 font-medium hidden md:table-cell">Bairro</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-gray-500 font-medium hidden lg:table-cell">Preço</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-gray-500 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-[10px] tracking-widest uppercase text-gray-500 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {imoveis.map(imovel => (
                <tr key={imovel.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 bg-[var(--color-warm-gray)] shrink-0 overflow-hidden">
                        {imovel.imagens[0] ? (
                          <img src={imovel.imagens[0].url} alt="" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-dark)] text-sm">{imovel.titulo}</p>
                        <p className="text-xs text-gray-400">{imovel.tipo} · {imovel.areaTotal}m²</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{imovel.endereco.bairro}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{formatPreco(imovel.preco)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${
                      imovel.statusAnuncio === 'ativo' ? 'bg-green-50 text-green-600' :
                      imovel.statusAnuncio === 'vendido' ? 'bg-amber-50 text-amber-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {imovel.statusAnuncio}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/imoveis/${imovel.slug}`} target="_blank" className="text-xs text-gray-400 hover:text-[var(--color-dark)] transition-colors">Ver</Link>
                      <Link href={`/admin/imoveis/${imovel.id}`} className="text-xs text-[var(--color-gold)] hover:text-[var(--color-dark)] transition-colors">Editar</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
