import Link from 'next/link'
import { getAllProperties } from '@/services/admin'
import { deleteProperty } from '@/services/admin'
import { formatPrice } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties()

  async function deleteAction(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    await deleteProperty(id)
    revalidatePath('/imoveis')
    revalidatePath('/')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Imóveis</h1>
        <Link href="/imoveis/novo" className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-700 transition">+ Novo imóvel</Link>
      </div>
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {properties.length === 0 ? (
          <p className="text-sm text-zinc-400 p-5">Nenhum imóvel cadastrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100">
              <tr>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Título</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Cidade</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Preço</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="px-5 py-3 text-zinc-900 font-medium">{p.title}</td>
                  <td className="px-5 py-3 text-zinc-500">{p.city}</td>
                  <td className="px-5 py-3 text-zinc-500">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <Link href={`/imoveis/${p.id}/editar`} className="text-zinc-500 hover:text-zinc-900 underline underline-offset-2">Editar</Link>
                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="text-red-400 hover:text-red-600 underline underline-offset-2">Excluir</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
