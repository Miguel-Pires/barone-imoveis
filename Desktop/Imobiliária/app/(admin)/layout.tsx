import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Barone Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 md:flex">
      <aside className="border-b border-zinc-200 bg-white px-4 py-4 md:fixed md:h-full md:w-56 md:border-b-0 md:border-r md:py-6">
        <span className="block px-2 text-base font-bold text-zinc-900 md:mb-8">Barone Admin</span>
        <nav className="mt-4 flex gap-1 md:mt-0 md:flex-col">
          <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900">Dashboard</Link>
          <Link href="/imoveis" className="rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900">Imoveis</Link>
        </nav>
      </aside>
      <main className="flex-1 p-4 md:ml-56 md:p-8">{children}</main>
    </div>
  )
}
