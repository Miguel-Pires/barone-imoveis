import { notFound } from 'next/navigation'
import { getPropertyById } from '@/services/admin'
import { PropertyForm } from '@/components/admin/PropertyForm'

export const dynamic = 'force-dynamic'

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id)
  if (!property) notFound()
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Editar: {property.title}</h1>
      <PropertyForm mode="edit" propertyId={property.id} defaultValues={property} />
    </div>
  )
}
