'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/books': 'My Books',
  '/words': 'Word Bank',
  '/words/review': 'Word Review',
  '/inspiration': 'Inspiration',
}

export default function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const title = pageTitles[pathname] ?? 'Bookmark'
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchAvatar = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()
      setAvatarUrl(data?.avatar_url ?? null)
    }
    fetchAvatar()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-12 bg-black text-white flex items-center justify-between px-4 md:pl-[76px] sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="text-white font-serif font-bold text-lg leading-none">B</span>
        <h1 className="text-sm font-semibold tracking-widest uppercase">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSignOut}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
        <div className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center overflow-hidden shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <User size={14} className="text-black" />
          )}
        </div>
      </div>
    </header>
  )
}
