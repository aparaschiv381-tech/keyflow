import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <span className="text-white font-black text-xl">🔑 KeyFlow</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/dashboard', label: '📊 Overview' },
            { href: '/dashboard/keys', label: '🗝️ API Keys' },
            { href: '/dashboard/billing', label: '💳 Billing' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition text-sm">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <p className="text-gray-500 text-xs truncate mb-2">{user.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
