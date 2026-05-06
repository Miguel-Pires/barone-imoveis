import { getDashboardStats } from '@/services/admin'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { propertyCount, recentLeads } = await getDashboardStats()
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 mb-10 max-w-sm">
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <p className="text-3xl font-bold text-zinc-900">{propertyCount}</p>
          <p className="text-sm text-zinc-500 mt-1">Imóveis</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <p className="text-3xl font-bold text-zinc-900">{recentLeads.length}</p>
          <p className="text-sm text-zinc-500 mt-1">Leads recentes</p>
        </div>
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">Últimos leads</h2>
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        {recentLeads.length === 0 ? (
          <p className="text-sm text-zinc-400 p-5">Nenhum lead ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100">
              <tr>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Nome</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Telefone</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Interesse</th>
                <th className="text-left px-5 py-3 text-zinc-500 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead: any) => (
                <tr key={lead.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="px-5 py-3 text-zinc-900">{lead.name || '—'}</td>
                  <td className="px-5 py-3 text-zinc-900">{lead.phone}</td>
                  <td className="px-5 py-3 text-zinc-600">{lead.interest}</td>
                  <td className="px-5 py-3 text-zinc-400">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
