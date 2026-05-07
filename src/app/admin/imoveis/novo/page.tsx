import ImovelForm from '@/components/admin/ImovelForm'

export default function NovoImovelPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-10">
      <div className="mb-6 md:mb-8">
        <h1
          className="text-3xl font-light text-[var(--color-dark)]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Novo Imóvel
        </h1>
        <p className="text-sm text-gray-400 mt-1">Preencha os dados para cadastrar um novo imóvel</p>
      </div>
      <ImovelForm />
    </div>
  )
}
