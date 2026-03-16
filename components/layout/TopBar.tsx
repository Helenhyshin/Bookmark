'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/books': 'My Books',
  '/words': 'Word Bank',
  '/inspiration': 'Inspiration',
  '/for-you': 'For You',
}

export default function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const title = pageTitles[pathname] ?? 'Folio'

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-12 bg-black text-white flex items-center justify-between px-4 md:pl-[76px] sticky top-0 z-30">
      <h1 className="text-sm font-semibold tracking-widest uppercase">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSignOut}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
        <div className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center">
          <User size={14} className="text-black" />
        </div>
      </div>
    </header>
  )
}
