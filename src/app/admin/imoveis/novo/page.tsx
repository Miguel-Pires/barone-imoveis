import ImovelForm from '@/components/admin/ImovelForm'

export default function NovoImovelPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
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
