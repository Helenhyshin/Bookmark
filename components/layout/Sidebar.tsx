'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Type, Sparkles } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/books', icon: BookOpen, label: 'Books' },
  { href: '/words', icon: Type, label: 'Words' },
  { href: '/inspiration', icon: Sparkles, label: 'Inspire' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-[60px] bg-black hidden md:flex flex-col items-center z-40">
      {/* Logo — h-12 matches TopBar height so "B" aligns with page title */}
      <div className="h-12 flex items-center justify-center shrink-0">
        <span className="text-white font-serif font-bold text-lg leading-none">B</span>
      </div>

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
