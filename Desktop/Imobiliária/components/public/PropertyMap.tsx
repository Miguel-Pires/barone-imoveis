export function PropertyMap({ latitude, longitude, title }: { latitude: number; longitude: number; title: string }) {
  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
  const embedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&output=embed&z=15`

  return (
    <section className="px-4 py-10 border-t border-zinc-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900">Localização</h2>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-zinc-900 underline underline-offset-2 transition">Abrir no Google Maps ↗</a>
        </div>
        <div className="rounded-2xl overflow-hidden border border-zinc-100 aspect-[16/9]">
          <iframe src={embedUrl} title={`Localização de ${title}`} className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      </div>
    </section>
  )
}
