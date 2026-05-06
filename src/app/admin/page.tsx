import Link from 'next/link'
import { getImoveis, formatPreco } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const todos = await getImoveis(false)
  const ativos = todos.filter(i => i.statusAnuncio === 'ativo')
  const inativos = todos.filter(i => i.statusAnuncio === 'inativo')
  const vendidos = todos.filter(i => i.statusAnuncio === 'vendido')

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-[var(--color-dark)]" style={{ fontFamily: 'var(--font-serif)' }}>
          Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-1">Visão geral da sua plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total de Imóveis', valor: todos.length, cor: 'text-[var(--color-dark)]' },
          { label: 'Anúncios Ativos', valor: ativos.length, cor: 'text-green-600' },
          { label: 'Inativos', valor: inativos.length, cor: 'text-gray-400' },
          { label: 'Vendidos', valor: vendidos.length, cor: 'text-[var(--color-gold)]' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-[var(--color-border)] p-5">
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">{card.label}</p>
            <p className={`text-3xl font-light ${card.cor}`} style={{ fontFamily: 'var(--font-serif)' }}>
              {card.valor}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[var(--color-border)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-light text-[var(--color-dark)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Imóveis Recentes
          </h2>
          <Link
            href="/admin/imoveis/novo"
            className="bg-[var(--color-gold)] text-white text-xs tracking-widest uppercase px-4 py-2 hover:bg-[var(--color-dark)] transition-colors"
          >
            + Adicionar
          </Link>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {todos.slice(0, 10).map(imovel => (
            <div key={imovel.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="w-14 h-10 bg-[var(--color-warm-gray)] shrink-0 overflow-hidden">
                {imovel.imagens[0] ? (
                  <img src={imovel.imagens[0].url} alt={imovel.titulo} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-dark)] truncate">{imovel.titulo}</p>
                <p className="text-xs text-gray-400">{imovel.endereco.bairro} · {formatPreco(imovel.preco)}</p>
              </div>
              <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 shrink-0 ${
                imovel.statusAnuncio === 'ativo' ? 'bg-green-50 text-green-600' :
                imovel.statusAnuncio === 'vendido' ? 'bg-amber-50 text-amber-600' :
                'bg-gray-100 text-gray-500'
              }`}>
                {imovel.statusAnuncio}
              </span>
              <Link
                href={`/admin/imoveis/${imovel.id}`}
                className="text-xs text-[var(--color-gold)] hover:text-[var(--color-dark)] transition-colors shrink-0"
              >
                Editar
              </Link>
            </div>
          ))}

          {todos.length === 0 && (
            <div className="px-6 py-10 text-center">
              <p className="text-gray-400 text-sm mb-4">Nenhum imóvel cadastrado ainda.</p>
              <Link
                href="/admin/imoveis/novo"
                className="inline-block bg-[var(--color-gold)] text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-[var(--color-dark)] transition-colors"
              >
                Adicionar primeiro imóvel
              </Link>
            </div>
          )}
        </div>

        {todos.length > 10 && (
          <div className="px-6 py-4 border-t border-[var(--color-border)]">
            <Link href="/admin/imoveis" className="text-xs text-[var(--color-gold)] hover:underline">
              Ver todos os imóveis →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
