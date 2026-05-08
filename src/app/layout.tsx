import type { Metadata } from 'next'
import './globals.css'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.imoveisbarone.com'

export const metadata: Metadata = {
  title: 'Barone Imóveis — Corretor de Imóveis no Centro de São Paulo',
  description: 'Imóveis de alto padrão no centro de São Paulo. Studios, apartamentos e coberturas nos melhores bairros: República, Higienópolis, Santa Cecília e mais.',
  keywords: 'imóveis centro são paulo, apartamento centro sp, barone imóveis, corretor centro sp',
  metadataBase: new URL(BASE),
  openGraph: {
    title: 'Barone Imóveis',
    description: 'Imóveis de alto padrão no centro de São Paulo.',
    url: BASE,
    siteName: 'Barone Imóveis',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
