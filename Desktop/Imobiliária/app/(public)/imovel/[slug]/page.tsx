import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PropertyAmenities } from '@/components/public/PropertyAmenities'
import { PropertyFeatures } from '@/components/public/PropertyFeatures'
import { PropertyFloorplans } from '@/components/public/PropertyFloorplans'
import { PropertyGallery } from '@/components/public/PropertyGallery'
import { PropertyHero } from '@/components/public/PropertyHero'
import { LeadForm } from '@/components/public/LeadForm'
import { PropertyMap } from '@/components/public/PropertyMap'
import { PropertyQuickInfo } from '@/components/public/PropertyQuickInfo'
import { ViewTracker } from '@/components/public/ViewTracker'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPropertyBySlug, getPropertySlugs } from '@/services/properties'

export const revalidate = 60

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = await getPropertySlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug)
  if (!property) return {}

  const bedroomsLabel =
    property.bedrooms_min === property.bedrooms_max
      ? `${property.bedrooms_min} quartos`
      : `${property.bedrooms_min} e ${property.bedrooms_max} quartos`

  return {
    title: `${property.title} | ${bedroomsLabel} em ${property.neighborhood ?? property.city}`,
    description: `${property.title}, ${bedroomsLabel}, ${property.area_min}-${property.area_max} m2, ${property.city}-${property.state}. ${property.description?.slice(0, 120) ?? 'Conheca este imovel e fale conosco.'}`,
    openGraph: {
      title: property.title,
      images: property.property_images?.[0]?.url ? [property.property_images[0].url] : [],
    },
  }
}

async function getLeadsCount(propertyId: string): Promise<number> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return 0
  }

  try {
    const supabase = createAdminClient()
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId)
    return count ?? 0
  } catch {
    return 0
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await getPropertyBySlug(params.slug)
  if (!property) notFound()

  const leadsCount = await getLeadsCount(property.id)
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `https://baroneimoveis.com/imovel/${property.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressRegion: property.state,
      addressCountry: 'BR',
    },
    ...(property.price && {
      offers: { '@type': 'Offer', price: property.price, priceCurrency: 'BRL' },
    }),
    ...(property.property_images?.length && {
      image: property.property_images.map((image) => image.url),
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <ViewTracker slug={params.slug} propertyId={property.id} />
      <main className="min-h-screen bg-white pb-48 md:pb-0">
        <PropertyHero
          property={property}
          whatsappNumber={waNumber}
          leadsCount={leadsCount}
        />
        {property.property_images && property.property_images.length > 0 && (
          <PropertyGallery images={property.property_images} title={property.title} />
        )}
        <PropertyQuickInfo property={property} />
        {property.description && (
          <section className="border-t border-zinc-100 px-4 py-10">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-4 text-xl font-bold text-zinc-900">Descricao</h2>
              <p className="whitespace-pre-line leading-relaxed text-zinc-600">
                {property.description}
              </p>
            </div>
          </section>
        )}
        <PropertyFeatures features={property.property_features ?? []} />
        <PropertyAmenities amenities={property.property_amenities ?? []} />
        {property.property_floorplans && property.property_floorplans.length > 0 && (
          <PropertyFloorplans floorplans={property.property_floorplans} />
        )}
        {property.latitude && property.longitude && (
          <PropertyMap
            latitude={property.latitude}
            longitude={property.longitude}
            title={property.title}
          />
        )}
        <LeadForm
          propertyId={property.id}
          propertyTitle={property.title}
          whatsappNumber={waNumber}
        />
      </main>
    </>
  )
}
