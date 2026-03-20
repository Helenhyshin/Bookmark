'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, LogOut, Settings, Star, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/books': 'My Books',
  '/words': 'Word Bank',
  '/words/review': 'Word Review',
  '/inspiration': 'Inspiration',
  '/settings': 'Settings',
}

export default function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const title = pageTitles[pathname] ?? 'Bookmark'
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? null)
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, username')
        .eq('id', user.id)
        .single()
      setAvatarUrl(data?.avatar_url ?? null)
      setUsername(data?.username ?? null)
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navigate = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  return (
    <header className="h-12 bg-black text-white flex items-center justify-between px-4 md:pl-[76px] sticky top-0 z-30">
      <h1 className="text-sm font-semibold tracking-widest uppercase">{title}</h1>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center overflow-hidden shrink-0 hover:opacity-90 transition-opacity"
        >
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
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-52 bg-white text-black rounded-xl shadow-xl overflow-hidden border border-stone-200 z-50">
            {/* Identity */}
            <div className="px-4 py-3 border-b border-stone-100">
              <p className="text-xs font-semibold truncate">{username ?? 'Reader'}</p>
              {email && <p className="text-xs text-stone-400 truncate">{email}</p>}
            </div>

            {/* Nav items */}
            <div className="py-1">
              <button
                onClick={() => navigate('/books')}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-stone-50 transition-colors"
              >
                <BookOpen size={14} className="text-stone-400" />
                My Books
              </button>
              <button
                onClick={() => navigate('/inspiration')}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-stone-50 transition-colors"
              >
                <Star size={14} className="text-stone-400" />
                Inspiration
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-stone-50 transition-colors"
              >
                <Settings size={14} className="text-stone-400" />
                Settings
              </button>
            </div>

            {/* Sign out */}
            <div className="border-t border-stone-100 py-1">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
