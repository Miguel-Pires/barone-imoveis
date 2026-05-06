'use client'

import { useState } from 'react'
import { formatPhone } from '@/lib/utils'
import { trackEvent } from '@/lib/tracking'
import { Button } from '@/components/ui/Button'

interface LeadFormProps {
  propertyId: string
  propertyTitle: string
  whatsappNumber: string
}

export function LeadForm({ propertyId, propertyTitle, whatsappNumber }: LeadFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [interest, setInterest] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (phone.length < 14) { setError('Telefone inválido. Ex: (11) 99999-9999'); return }
    setError('')
    setLoading(true)
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId, name: name || undefined, phone, interest }),
    })
    setLoading(false)
    if (res.ok) {
      trackEvent('submit_lead', { property_id: propertyId, interest })
      setSubmitted(true)
      const waMsg = `Olá${name ? `, me chamo ${name}` : ''} e tenho interesse no imóvel ${propertyTitle}`
      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMsg)}`
      setTimeout(() => window.open(waUrl, '_blank'), 600)
    } else {
      setError('Erro ao enviar. Tente novamente.')
    }
  }

  const successMsg = (
    <div className="text-center py-4">
      <p className="text-lg mb-1">✓</p>
      <p className="font-semibold text-zinc-900 text-sm">Recebemos seu contato!</p>
    </div>
  )

  const form = submitted ? successMsg : (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="text" placeholder="Seu nome (opcional)" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900" />
      <input type="tel" placeholder="Telefone (obrigatório)" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900" required />
      <select value={interest} onChange={(e) => setInterest(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900" required>
        <option value="">Qual é seu interesse?</option>
        <option value="comprar">Quero comprar</option>
        <option value="investir">Quero investir</option>
        <option value="alugar">Quero alugar</option>
        <option value="informacoes">Só quero informações</option>
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Enviando…' : 'Quero ser contactado'}
      </Button>
    </form>
  )

  return (
    <>
      <section className="hidden md:block px-4 py-10 border-t border-zinc-100 bg-zinc-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Fale com um especialista</h2>
          <p className="text-sm text-zinc-500 mb-6">Preencha abaixo e entraremos em contato rapidamente.</p>
          <div className="max-w-md">{form}</div>
        </div>
      </section>
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-zinc-200 px-4 pt-3 pb-4 shadow-lg">
        <p className="text-sm font-semibold text-zinc-900 mb-2">Tenho interesse neste imóvel</p>
        {form}
      </div>
    </>
  )
}
