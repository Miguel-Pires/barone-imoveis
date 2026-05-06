import { PropertyForm } from '@/components/admin/PropertyForm'

export const dynamic = 'force-dynamic'

export default function NewPropertyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Novo imóvel</h1>
      <PropertyForm mode="create" />
    </div>
  )
}
