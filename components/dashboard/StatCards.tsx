'use client'

import { useEffect, useState } from 'react'
import { BookMarked, CheckCircle, Type, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  toRead: number
  completed: number
  words: number
  inspirations: number
}

export default function StatCards() {
  const [stats, setStats] = useState<Stats>({ toRead: 0, completed: 0, words: 0, inspirations: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [books, words, insps] = await Promise.all([
        supabase.from('books').select('status').eq('user_id', user.id),
        supabase.from('word_bank').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('inspirations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ])

      const toRead = books.data?.filter((b) => b.status === 'want_to_read').length ?? 0
      const completed = books.data?.filter((b) => b.status === 'completed').length ?? 0

      setStats({
        toRead,
        completed,
        words: words.count ?? 0,
        inspirations: insps.count ?? 0,
      })
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'To Read', value: stats.toRead, icon: BookMarked, color: '#D4AF37' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#22c55e' },
    { label: 'Words', value: stats.words, icon: Type, color: '#800080' },
    { label: 'Inspirations', value: stats.inspirations, icon: Sparkles, color: '#3b82f6' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
            <Icon size={16} style={{ color }} />
          </div>
          <p className="text-3xl font-bold font-serif">{value}</p>
        </div>
      ))}
    </div>
  )
}
