'use client'

import { useState } from 'react'

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function CompressorFotos() {
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(0)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<{ compressed: number; skipped: number; errors: number; savedBytes: number } | null>(null)

  async function run() {
    setRunning(true)
    setStats(null)
    setDone(0)
    setTotal(0)

    const res = await fetch('/api/imoveis?todos=1')
    const imoveis: Array<{
      imagens?: Array<{ url: string }>
      plantasBaixas?: Array<{ imagemUrl: string }>
    }> = await res.json()

    const urls: string[] = []
    for (const imovel of imoveis) {
      for (const img of imovel.imagens ?? []) {
        if (img.url) urls.push(img.url)
      }
      for (const planta of imovel.plantasBaixas ?? []) {
        if (planta.imagemUrl) urls.push(planta.imagemUrl)
      }
    }

    setTotal(urls.length)

    let compressed = 0, skipped = 0, errors = 0, savedBytes = 0

    for (const url of urls) {
      const r = await fetch('/api/admin/compress-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await r.json()
      if (data.success) {
        compressed++
        savedBytes += data.saved ?? 0
      } else if (data.reason === 'error') {
        errors++
      } else {
        skipped++
      }
      setDone(d => d + 1)
    }

    setStats({ compressed, skipped, errors, savedBytes })
    setRunning(false)
  }

  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="bg-white border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-light text-[var(--color-dark)]" style={{ fontFamily: 'var(--font-serif)' }}>
            Otimizar Fotos Existentes
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Recomprime todas as fotos para reduzir o tamanho e acelerar o carregamento</p>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="bg-[var(--color-gold)] text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-[var(--color-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? 'Processando...' : 'Otimizar'}
        </button>
      </div>

      {running && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>{done} de {total} fotos</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-gold)] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {stats && !running && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[var(--color-border)]">
          {[
            { label: 'Comprimidas', valor: stats.compressed, cor: 'text-green-600' },
            { label: 'Já otimizadas', valor: stats.skipped, cor: 'text-gray-400' },
            { label: 'Erros', valor: stats.errors, cor: 'text-red-500' },
            { label: 'Espaço economizado', valor: formatBytes(stats.savedBytes), cor: 'text-[var(--color-gold)]' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[10px] tracking-widest uppercase text-gray-400">{item.label}</p>
              <p className={`text-xl font-light mt-0.5 ${item.cor}`} style={{ fontFamily: 'var(--font-serif)' }}>
                {item.valor}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
