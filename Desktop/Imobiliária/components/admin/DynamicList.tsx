'use client'

import { useState } from 'react'

interface DynamicListProps { label: string; items: string[]; onChange: (items: string[]) => void }

export function DynamicList({ label, items, onChange }: DynamicListProps) {
  const [draft, setDraft] = useState('')

  function add() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...items, trimmed])
    setDraft('')
  }

  return (
    <div>
      <p className="text-sm font-medium text-zinc-700 mb-2">{label}</p>
      <div className="flex gap-2 mb-2">
        <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={`Adicionar ${label.toLowerCase()}…`} className="flex-1 px-3 py-2 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" />
        <button type="button" onClick={add} className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-xl hover:bg-zinc-700 transition">+</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full text-sm text-zinc-700">
            {item}
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-zinc-400 hover:text-zinc-700">×</button>
          </span>
        ))}
      </div>
    </div>
  )
}
