'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getRecommendations } from '@/lib/ai-helpers'
import type { Book, Recommendation } from '@/lib/types'

export default function AIPicks() {
  const [picks, setPicks] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPicks = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: books } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id)

    setPicks(getRecommendations((books as Book[]) ?? []))
    setLoading(false)
  }

  useEffect(() => { fetchPicks() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">AI Picks</h2>
        <button
          onClick={fetchPicks}
          className="text-gray-400 hover:text-black transition-colors"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="shrink-0 w-36 md:w-auto bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                <div className="w-full h-28 bg-gray-100 rounded-lg mb-3" />
                <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-2 bg-gray-100 rounded w-1/2" />
              </div>
            ))
          : picks.map((pick) => (
              <div
                key={pick.title}
                className="shrink-0 w-36 md:w-auto bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div
                  className="w-full h-28 rounded-lg mb-3"
                  style={{ backgroundColor: pick.coverColor }}
                />
                <p className="font-serif text-sm font-semibold leading-tight">{pick.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">{pick.author}</p>
                <span className="inline-block text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {pick.genre}
                </span>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-3">{pick.reasoning}</p>
              </div>
            ))}
      </div>
    </div>
  )
}
