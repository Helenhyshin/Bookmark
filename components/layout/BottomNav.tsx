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

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black flex md:hidden justify-around items-center z-40 border-t border-gray-800">
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
              isActive ? 'text-[#D4AF37]' : 'text-gray-500'
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
