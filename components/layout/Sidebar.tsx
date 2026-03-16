'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Type, Sparkles, Star } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/books', icon: BookOpen, label: 'Books' },
  { href: '/words', icon: Type, label: 'Words' },
  { href: '/inspiration', icon: Sparkles, label: 'Inspire' },
  { href: '/for-you', icon: Star, label: 'For You' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-[60px] bg-black hidden md:flex flex-col items-center py-6 gap-8 z-40">
      {/* Logo */}
      <div className="text-white font-serif font-bold text-lg leading-none">F</div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-6 flex-1 mt-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex flex-col items-center gap-1 group transition-colors ${
                isActive ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-white'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
