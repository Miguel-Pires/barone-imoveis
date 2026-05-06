'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DynamicList } from '@/components/admin/DynamicList'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { generateSlug } from '@/lib/utils'

interface RelationName {
  name: string
}

interface RelationUrl {
  url: string
}

interface PropertyFormValues {
  id?: string
  title?: string
  slug?: string
  description?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  price?: number | null
  bedrooms_min?: number
  bedrooms_max?: number
  bathrooms?: number
  area_min?: number
  area_max?: number
  parking?: number
  latitude?: number | null
  longitude?: number | null
  is_launch?: boolean
  urgency_text?: string | null
  property_features?: RelationName[]
  property_amenities?: RelationName[]
  property_images?: RelationUrl[]
  property_floorplans?: RelationUrl[]
}

interface PropertyFormProps {
  mode: 'create' | 'edit'
  propertyId?: string
  defaultValues?: PropertyFormValues
}

export function PropertyForm({ mode, propertyId, defaultValues = {} }: PropertyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [features, setFeatures] = useState<string[]>(
    defaultValues.property_features?.map((feature) => feature.name) ?? []
  )
  const [amenities, setAmenities] = useState<string[]>(
    defaultValues.property_amenities?.map((amenity) => amenity.name) ?? []
  )
  const [images, setImages] = useState<string[]>(
    defaultValues.property_images?.map((image) => image.url) ?? []
  )
  const [floorplans, setFloorplans] = useState<string[]>(
    defaultValues.property_floorplans?.map((floorplan) => floorplan.url) ?? []
  )
  const [title, setTitle] = useState(defaultValues.title ?? '')

  const slugValue = useMemo(
    () => defaultValues.slug ?? generateSlug(title),
    [defaultValues.slug, title]
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const property = {
      title: String(form.get('title') ?? ''),
      slug: String(form.get('slug') ?? ''),
      description: nullableString(form.get('description')),
      neighborhood: nullableString(form.get('neighborhood')),
      city: nullableString(form.get('city')),
      state: nullableString(form.get('state')),
      price: nullableNumber(form.get('price')),
      bedrooms_min: requiredNumber(form.get('bedrooms_min')),
      bedrooms_max: requiredNumber(form.get('bedrooms_max')),
      bathrooms: requiredNumber(form.get('bathrooms')),
      area_min: requiredNumber(form.get('area_min')),
      area_max: requiredNumber(form.get('area_max')),
      parking: requiredNumber(form.get('parking')),
      latitude: nullableNumber(form.get('latitude')),
      longitude: nullableNumber(form.get('longitude')),
      is_launch: form.get('is_launch') === 'on',
      urgency_text: nullableString(form.get('urgency_text')),
    }

    const endpoint =
      mode === 'create'
        ? '/api/admin/properties'
        : `/api/admin/properties/${propertyId}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property, features, amenities, images, floorplans }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: unknown } | null
      setError(typeof data?.error === 'string' ? data.error : 'Erro ao salvar imovel.')
      return
    }

    router.push('/imoveis')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Titulo *"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            key={slugValue}
            label="Slug *"
            name="slug"
            required
            defaultValue={slugValue}
            placeholder="vibra-rio-bonito-sao-paulo-sp"
          />
        </div>

        <Input label="Bairro" name="neighborhood" defaultValue={defaultValues.neighborhood ?? ''} />
        <Input label="Cidade" name="city" defaultValue={defaultValues.city ?? ''} />
        <Input label="Estado (UF)" name="state" defaultValue={defaultValues.state ?? ''} maxLength={2} />
        <Input label="Preco (vazio = sob consulta)" name="price" type="number" defaultValue={defaultValues.price ?? ''} />
        <Input label="Quartos min." name="bedrooms_min" type="number" min={0} defaultValue={defaultValues.bedrooms_min ?? 1} required />
        <Input label="Quartos max." name="bedrooms_max" type="number" min={0} defaultValue={defaultValues.bedrooms_max ?? 1} required />
        <Input label="Area min. (m2)" name="area_min" type="number" min={0} defaultValue={defaultValues.area_min ?? 0} required />
        <Input label="Area max. (m2)" name="area_max" type="number" min={0} defaultValue={defaultValues.area_max ?? 0} required />
        <Input label="Banheiros" name="bathrooms" type="number" min={0} defaultValue={defaultValues.bathrooms ?? 1} required />
        <Input label="Vagas" name="parking" type="number" min={0} defaultValue={defaultValues.parking ?? 0} required />
        <Input label="Latitude" name="latitude" type="number" step="any" defaultValue={defaultValues.latitude ?? ''} />
        <Input label="Longitude" name="longitude" type="number" step="any" defaultValue={defaultValues.longitude ?? ''} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Descricao</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={defaultValues.description ?? ''}
          className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <Input
        label="Microcopy de urgencia"
        name="urgency_text"
        defaultValue={defaultValues.urgency_text ?? ''}
        placeholder="Ex: Ultimas unidades disponiveis"
      />

      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
        <input type="checkbox" name="is_launch" defaultChecked={defaultValues.is_launch ?? false} className="rounded" />
        Lancamento
      </label>

      <DynamicList label="Diferenciais" items={features} onChange={setFeatures} />
      <DynamicList label="Amenidades" items={amenities} onChange={setAmenities} />
      <ImageUpload bucket="property-images" propertyId={propertyId ?? 'draft'} urls={images} onChange={setImages} label="Fotos do imovel" />
      <ImageUpload bucket="property-floorplans" propertyId={propertyId ?? 'draft'} urls={floorplans} onChange={setFloorplans} label="Plantas baixas" />

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? 'Salvando...' : mode === 'create' ? 'Criar imovel' : 'Salvar alteracoes'}
      </Button>
    </form>
  )
}

function nullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim()
  return text.length > 0 ? text : null
}

function nullableNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim()
  return text.length > 0 ? Number(text) : null
}

function requiredNumber(value: FormDataEntryValue | null) {
  return Number(value ?? 0)
}
