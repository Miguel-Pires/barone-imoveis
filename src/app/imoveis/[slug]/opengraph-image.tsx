import { ImageResponse } from 'next/og'
import { getImovelBySlug } from '@/lib/db'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const TIPO_LABEL: Record<string, string> = {
  apartamento: 'Apartamento',
  cobertura: 'Cobertura',
  studio: 'Studio',
  loft: 'Loft',
  penthouse: 'Penthouse',
}

function formatPrecoOG(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const imovel = await getImovelBySlug(slug)

  if (!imovel) {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1A1A1A',
          color: '#B8975A',
          fontSize: 48,
          fontWeight: 300,
          letterSpacing: 8,
        }}
      >
        BARONE IMÓVEIS
      </div>,
      { width: 1200, height: 630 }
    )
  }

  const tipo = TIPO_LABEL[imovel.tipo] ?? imovel.tipo
  const bairro = imovel.endereco.bairro
  const preco = formatPrecoOG(imovel.preco)
  const capa = imovel.imagens.find(i => i.destaque)?.url ?? imovel.imagens[0]?.url

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1A1A1A',
        position: 'relative',
      }}
    >
      {capa && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={capa}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.25,
          }}
        />
      )}

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)',
          display: 'flex',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '60px',
          height: '100%',
        }}
      >
        <div style={{ display: 'flex', marginBottom: '16px' }}>
          <span
            style={{
              color: '#B8975A',
              fontSize: '14px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontWeight: 500,
            }}
          >
            {bairro.toUpperCase()} · {tipo.toUpperCase()}
          </span>
        </div>

        <div
          style={{
            fontSize: imovel.titulo.length > 40 ? '40px' : '52px',
            color: 'white',
            fontWeight: 300,
            lineHeight: 1.1,
            marginBottom: '12px',
          }}
        >
          {imovel.titulo}
        </div>

        {imovel.subtitulo && (
          <div
            style={{
              fontSize: '20px',
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 300,
              marginBottom: '12px',
            }}
          >
            {imovel.subtitulo}
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '20px' }}>
            {imovel.areaTotal}m²
          </span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '20px' }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '20px' }}>
            {imovel.quartos} {imovel.quartos === 1 ? 'dorm.' : 'dorms.'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '20px' }}>·</span>
          <span style={{ color: '#B8975A', fontSize: '26px', fontWeight: 500 }}>
            {preco}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '15px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            BARONE IMÓVEIS
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
            imoveisbarone.com
          </span>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  )
}
