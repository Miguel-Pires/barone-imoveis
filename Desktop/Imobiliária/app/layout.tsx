import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Barone Imoveis',
    template: '%s | Barone Imoveis',
  },
  description: 'Encontre apartamentos e empreendimentos com atendimento direto.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  )
}
