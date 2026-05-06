import { notFound } from 'next/navigation'
import { getImovelBySlug, getImoveis, formatPreco } from '@/lib/db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import GaleriaFotos from '@/components/GaleriaFotos'
import PlantasBaixas from '@/components/PlantasBaixas'
import type { Metadata } from 'next'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '5511940726116'

const TIPO_LABEL: Record<string, string> = {
  apartamento: 'Apartamento', cobertura: 'Cobertura', studio: 'Studio', loft: 'Loft', penthouse: 'Penthouse',
}
const STATUS_LABEL: Record<string, string> = {
  lancamento: 'Lançamento', em_construcao: 'Em Construção', pronto: 'Pronto para Morar', usado: 'Revenda',
}

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const imoveis = await getImoveis(false)
    return imoveis.map(i => ({ slug: i.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const imovel = await getImovelBySlug(slug)
  if (!imovel) return {}
  return {
    title: `${imovel.titulo} — Barone Imóveis`,
    description: imovel.descricao.slice(0, 160),
  }
}

export default async function ImovelPage({ params }: Props) {
  const { slug } = await params
  const imovel = await getImovelBySlug(slug)
  if (!imovel || imovel.statusAnuncio !== 'ativo') notFound()

  const whatsappMsg = encodeURIComponent(
    `Olá! Tenho interesse no imóvel "${imovel.titulo}" (${imovel.endereco.bairro}). Poderia me dar mais informações?`
  )
  const whatsappVisita = encodeURIComponent(
    `Olá! Gostaria de agendar uma visita ao imóvel "${imovel.titulo}" em ${imovel.endereco.bairro}.`
  )

  return (
    <>
      <Header />
      <main className="pt-16">
        <GaleriaFotos imagens={imovel.imagens} titulo={imovel.titulo} />

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Coluna principal */}
            <div className="lg:col-span-2">
              <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                <a href="/" className="hover:text-[var(--color-gold)] transition-colors">Início</a>
                <span>/</span>
                <a href="/#imoveis" className="hover:text-[var(--color-gold)] transition-colors">Imóveis</a>
                <span>/</span>
                <span className="text-[var(--color-dark)]">{imovel.titulo}</span>
              </nav>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] tracking-[0.25em] text-[var(--color-gold)] uppercase font-medium">
                  {TIPO_LABEL[imovel.tipo]} · {imovel.endereco.bairro}
                </span>
                <span className="text-[10px] tracking-widest uppercase bg-[var(--color-dark)] text-white px-2.5 py-1">
                  {STATUS_LABEL[imovel.status]}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-light text-[var(--color-dark)] mb-4 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                {imovel.titulo}
              </h1>
              {imovel.subtitulo && (
                <p className="text-lg text-gray-500 font-light mb-6">{imovel.subtitulo}</p>
              )}

              {/* Ficha técnica */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--color-border)] border border-[var(--color-border)] mb-10">
                {[
                  { label: 'Área total', value: `${imovel.areaTotal}m²` },
                  { label: imovel.quartos === 1 ? 'Dormitório' : 'Dormitórios', value: String(imovel.quartos) },
                  { label: imovel.banheiros === 1 ? 'Banheiro' : 'Banheiros', value: String(imovel.banheiros) },
                  { label: imovel.vagas === 1 ? 'Vaga' : 'Vagas', value: String(imovel.vagas) },
                  ...(imovel.suites ? [{ label: 'Suítes', value: String(imovel.suites) }] : []),
                  ...(imovel.andarUnidade ? [{ label: 'Andar', value: `${imovel.andarUnidade}º` }] : []),
                  ...(imovel.totalAndares ? [{ label: 'Total andares', value: String(imovel.totalAndares) }] : []),
                  ...(imovel.areaUtil ? [{ label: 'Área útil', value: `${imovel.areaUtil}m²` }] : []),
                ].map((item) => (
                  <div key={item.label} className="bg-white px-5 py-4">
                    <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-1">{item.label}</p>
                    <p className="text-xl font-light text-[var(--color-dark)]" style={{ fontFamily: 'var(--font-serif)' }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Descrição */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-[var(--color-dark)] mb-4 gold-line" style={{ fontFamily: 'var(--font-serif)' }}>
                  Sobre o Imóvel
                </h2>
                <p className="text-gray-600 font-light leading-relaxed mt-6">{imovel.descricao}</p>
              </div>

              {/* Diferenciais */}
              {imovel.diferenciais.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-light text-[var(--color-dark)] mb-6 gold-line" style={{ fontFamily: 'var(--font-serif)' }}>
                    Diferenciais
                  </h2>
                  <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {imovel.diferenciais.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Plantas Baixas */}
              {imovel.plantasBaixas.length > 0 && (
                <PlantasBaixas plantas={imovel.plantasBaixas} />
              )}

              {/* Endereço */}
              <div className="mb-12">
                <h2 className="text-2xl font-light text-[var(--color-dark)] mb-4 gold-line" style={{ fontFamily: 'var(--font-serif)' }}>
                  Localização
                </h2>
                <p className="text-gray-600 mt-6">
                  {imovel.endereco.rua}, {imovel.endereco.numero}
                  {imovel.endereco.complemento && ` — ${imovel.endereco.complemento}`}
                  <br />
                  {imovel.endereco.bairro} · {imovel.endereco.cidade}/{imovel.endereco.estado}
                  <br />
                  CEP {imovel.endereco.cep}
                </p>
              </div>
            </div>

            {/* Sidebar CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="border border-[var(--color-border)] p-6">
                  <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-1">A partir de</p>
                  <p className="text-3xl font-light text-[var(--color-dark)] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                    {formatPreco(imovel.preco)}
                  </p>
                  {imovel.precoCondominio && (
                    <p className="text-xs text-gray-400 mb-4">
                      + Condomínio: {formatPreco(imovel.precoCondominio)}/mês
                      {imovel.precoIPTU && ` · IPTU: ${formatPreco(imovel.precoIPTU)}/ano`}
                    </p>
                  )}

                  <div className="border-t border-[var(--color-border)] pt-4 mt-4 space-y-4">
                    <a
                      href={`https://wa.me/${WHATSAPP}?text=${whatsappMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-4 text-sm tracking-widest uppercase font-medium hover:bg-[#20B954] transition-colors"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Tenho Interesse
                    </a>
                    <a
                      href={`https://wa.me/${WHATSAPP}?text=${whatsappVisita}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full border border-[var(--color-gold)] text-[var(--color-gold)] py-3.5 text-sm tracking-widest uppercase hover:bg-[var(--color-gold)] hover:text-white transition-all"
                    >
                      Agendar Visita
                    </a>
                  </div>
                </div>

                <div className="border border-[var(--color-border)] p-6 bg-[var(--color-warm-gray)]">
                  <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-3">Corretor Responsável</p>
                  <p className="text-lg font-light text-[var(--color-dark)] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                    Barone
                  </p>
                  <p className="text-xs text-gray-500 mb-4">CRECI 000000-F · Especialista Centro SP</p>
                  <div className="border-t border-[var(--color-border)] pt-4">
                    <p className="text-xs text-gray-400 mb-1">Localização</p>
                    <p className="text-xs text-gray-600">
                      {imovel.endereco.bairro}, {imovel.endereco.cidade}/{imovel.endereco.estado}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
