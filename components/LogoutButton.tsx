'use client'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button onClick={logout}
      className="w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition text-left">
      Sign out
    </button>
  )
}
