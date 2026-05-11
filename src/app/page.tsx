import Image from 'next/image'
import { getImoveis, getCorretor } from '@/lib/db'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ImovelCard from '@/components/ImovelCard'
import WhatsAppFloat from '@/components/WhatsAppFloat'

const WHATSAPP_CONTATO = encodeURIComponent('Olá, gostaria de agendar uma visita ou tirar dúvidas sobre imóveis.')

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.imoveisbarone.com'

export default async function HomePage() {
  const [imoveis, corretor] = await Promise.all([getImoveis(true), getCorretor()])
  const WHATSAPP = corretor.whatsapp
  const destaques = imoveis.filter(i => i.destaque)
  const outros = imoveis.filter(i => !i.destaque)

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Barone Imóveis',
    url: BASE,
    telephone: `+${corretor.whatsapp}`,
    ...(corretor.email && { email: corretor.email }),
    ...(corretor.creci && { taxID: `CRECI ${corretor.creci}` }),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    areaServed: [
      { '@type': 'Place', name: 'Higienópolis, São Paulo' },
      { '@type': 'Place', name: 'República, São Paulo' },
      { '@type': 'Place', name: 'Santa Cecília, São Paulo' },
      { '@type': 'Place', name: 'Vila Buarque, São Paulo' },
    ],
    priceRange: 'Alto Padrão',
    description: 'Corretor especializado em imóveis de alto padrão no centro de São Paulo.',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-screen flex items-center bg-[var(--color-dark)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#2C2420] opacity-90" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(184,151,90,0.3) 79px,rgba(184,151,90,0.3) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(184,151,90,0.3) 79px,rgba(184,151,90,0.3) 80px)`,
            }}
          />

          <div className="relative max-w-7xl mx-auto px-6 py-32 pt-44">
            <div className="max-w-3xl">
              <p className="text-[var(--color-gold)] text-xs tracking-[0.4em] uppercase mb-6 font-medium">
                Centro de São Paulo · Alto Padrão
              </p>
              <h1
                className="text-5xl md:text-7xl font-light text-white leading-[1.1] mb-8"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Encontre o imóvel perfeito no{' '}
                <em className="not-italic text-[var(--color-gold-light)]">coração</em>{' '}
                de São Paulo
              </h1>
              <p className="text-gray-400 text-lg font-light leading-relaxed mb-12 max-w-xl">
                Corretor especializado em imóveis de alto padrão nos bairros mais
                valorizados do centro paulistano. Atendimento exclusivo e personalizado.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${WHATSAPP_CONTATO}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-[var(--color-gold)] text-white px-8 py-4 text-sm tracking-widest uppercase font-medium hover:bg-white hover:text-[var(--color-dark)] transition-all duration-300"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Falar com o Corretor
                </a>
                <a
                  href="#imoveis"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 text-sm tracking-widest uppercase font-light hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-300"
                >
                  Ver Imóveis
                </a>
              </div>
            </div>
          </div>

          <a
            href="#imoveis"
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 hover:text-[var(--color-gold)] transition-colors"
          >
            <span className="text-[9px] tracking-[0.3em] uppercase">Explorar</span>
            <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </section>

        {/* Imóveis */}
        <section id="imoveis" className="max-w-7xl mx-auto px-6 py-24">
          {destaques.length > 0 && (
            <>
              <div className="mb-12">
                <p className="text-[var(--color-gold)] text-xs tracking-[0.3em] uppercase mb-3">Selecionados para você</p>
                <h2 className="text-4xl md:text-5xl font-light text-[var(--color-dark)] gold-line" style={{ fontFamily: 'var(--font-serif)' }}>
                  Imóveis em Destaque
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                {destaques.map(imovel => <ImovelCard key={imovel.id} imovel={imovel} />)}
              </div>
            </>
          )}

          {outros.length > 0 && (
            <>
              <div className="mb-12">
                <h2 className="text-4xl md:text-5xl font-light text-[var(--color-dark)] gold-line" style={{ fontFamily: 'var(--font-serif)' }}>
                  {destaques.length > 0 ? 'Outros Imóveis' : 'Todos os Imóveis'}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outros.map(imovel => <ImovelCard key={imovel.id} imovel={imovel} />)}
              </div>
            </>
          )}

          {imoveis.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg" style={{ fontFamily: 'var(--font-serif)' }}>Novos imóveis em breve.</p>
              <p className="text-gray-500 text-sm mt-2">Entre em contato para saber das últimas oportunidades.</p>
            </div>
          )}
        </section>

        {/* Sobre */}
        <section id="sobre" className="bg-[var(--color-dark)] text-white">
          <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[var(--color-gold)] text-xs tracking-[0.3em] uppercase mb-4">Quem somos</p>
              <h2 className="text-4xl md:text-5xl font-light text-white mb-8 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                {corretor.nome} — <em className="not-italic text-[var(--color-gold-light)]">Expertise</em> no Centro de SP
              </h2>
              {corretor.fotoPerfil && (
                <div className="flex items-center gap-4 mb-8">
                  <Image
                    src={corretor.fotoPerfil}
                    alt={corretor.nome}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[var(--color-gold)]"
                  />
                  <div>
                    <p className="text-white font-light">{corretor.nome}</p>
                    {corretor.especialidade && <p className="text-xs text-gray-400">{corretor.especialidade}</p>}
                    {corretor.creci && <p className="text-xs text-[var(--color-gold)]">CRECI {corretor.creci}</p>}
                  </div>
                </div>
              )}
              <p className="text-gray-400 font-light leading-relaxed mb-6">
                {corretor.bio || 'Corretor especializado em imóveis de alto padrão no centro de São Paulo — região em constante valorização, com empreendimentos modernos e excelente infraestrutura urbana.'}
              </p>
              <p className="text-gray-400 font-light leading-relaxed mb-10">
                {corretor.bio2 || 'Atendimento 100% personalizado, do primeiro contato ao registro em cartório. Cada imóvel é selecionado com critério de qualidade e potencial de valorização.'}
              </p>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${WHATSAPP_CONTATO}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border border-[var(--color-gold)] text-[var(--color-gold)] px-8 py-4 text-sm tracking-widest uppercase hover:bg-[var(--color-gold)] hover:text-white transition-all duration-300"
              >
                Agendar Conversa
              </a>
            </div>
            <div className="relative">
              {corretor.fotoCapa ? (
                <div className="relative w-full h-80">
                  <Image
                    src={corretor.fotoCapa}
                    alt={`${corretor.nome} — foto de capa`}
                    fill
                    sizes="(max-width: 1280px) 100vw, 640px"
                    className="object-cover border border-gray-800"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {['República', 'Higienópolis', 'Santa Cecília', 'Vila Buarque'].map((bairro) => (
                    <div key={bairro} className="border border-gray-800 hover:border-[var(--color-gold)] p-6 transition-colors">
                      <p className="text-lg font-light text-white mb-1" style={{ fontFamily: 'var(--font-serif)' }}>{bairro}</p>
                      <p className="text-xs text-gray-600 tracking-wide">Centro de São Paulo</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section id="contato" className="bg-[var(--color-warm-gray)] border-t border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-6 py-24 text-center">
            <p className="text-[var(--color-gold)] text-xs tracking-[0.4em] uppercase mb-4">Pronto para dar o próximo passo?</p>
            <h2 className="text-4xl md:text-5xl font-light text-[var(--color-dark)] mb-6 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              Encontre seu imóvel ideal com quem entende o mercado
            </h2>
            <p className="text-gray-500 font-light mb-10 max-w-lg mx-auto">
              Entre em contato agora mesmo. Respondo rápido e com as melhores opções para o seu perfil.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${WHATSAPP_CONTATO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-5 text-sm tracking-widest uppercase font-medium hover:bg-[#20B954] transition-colors shadow-lg"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Iniciar Conversa no WhatsApp
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  )
}
