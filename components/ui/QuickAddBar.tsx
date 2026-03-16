'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface QuickAddBarProps {
  onAdded?: () => void
}

export default function QuickAddBar({ onAdded }: QuickAddBarProps) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    await supabase.from('books').insert({
      user_id: user.id,
      title: value.trim(),
      status: 'want_to_read',
      cover_color: randomCoverColor(),
    })

    setValue('')
    setLoading(false)
    onAdded?.()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm"
    >
      <Search size={16} className="text-gray-400 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Quick-add a book title or word…"
        className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-gray-400"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="flex items-center gap-1 bg-black text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-900 transition-colors"
      >
        <Plus size={14} />
        Add
      </button>
    </form>
  )
}

function randomCoverColor() {
  const colors = ['#8B7355', '#2C3E50', '#1A472A', '#6B4226', '#3B3B6D', '#8E4B2E', '#5C4033', '#2E4057']
  return colors[Math.floor(Math.random() * colors.length)]
}
