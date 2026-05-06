'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  bucket: 'property-images' | 'property-floorplans'
  propertyId: string
  urls: string[]
  onChange: (urls: string[]) => void
  label?: string
}

export function ImageUpload({
  bucket,
  propertyId,
  urls,
  onChange,
  label = 'Imagens',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.set('bucket', bucket)
    formData.set('propertyId', propertyId)
    Array.from(files).forEach((file) => formData.append('files', file))

    const res = await fetch('/api/admin/uploads', {
      method: 'POST',
      body: formData,
    })

    setUploading(false)

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      setError(data?.error ?? 'Erro ao enviar imagem.')
      return
    }

    const data = (await res.json()) as { urls: string[] }
    onChange([...urls, ...data.urls])
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-zinc-700">{label}</p>
      <div className="mb-3 flex flex-wrap gap-3">
        {urls.map((url) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-xl border border-zinc-200">
            <Image src={url} alt="" fill className="object-cover" sizes="96px" />
            <button
              type="button"
              onClick={() => onChange(urls.filter((item) => item !== url))}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black"
              aria-label="Remover imagem"
            >
              x
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 text-2xl text-zinc-400 transition hover:border-zinc-400 disabled:opacity-50"
          aria-label="Adicionar imagem"
        >
          {uploading ? '...' : '+'}
        </button>
      </div>
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
