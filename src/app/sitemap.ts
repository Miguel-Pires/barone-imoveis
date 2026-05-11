import type { MetadataRoute } from 'next'
import { getImoveis } from '@/lib/db'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.imoveisbarone.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const imoveis = await getImoveis(true)

  const propriedades: MetadataRoute.Sitemap = imoveis.map(i => ({
    url: `${BASE}/imoveis/${i.slug}`,
    lastModified: new Date(i.atualizadoEm),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...propriedades,
  ]
}
