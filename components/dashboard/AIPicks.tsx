'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { RefreshCw, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getRecommendations } from '@/lib/ai-helpers'
import RecommendationCard from '@/components/for-you/RecommendationCard'
import type { Book, Recommendation } from '@/lib/types'

const CARD_WIDTH = 180
const CARD_GAP = 16
const SCROLL_AMOUNT = (CARD_WIDTH + CARD_GAP) * 3

export default function AIPicks() {
  const [picks, setPicks] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const offset = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT
    el.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const fetchPicks = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    try {
      const res = await fetch('/api/recommendations', { method: 'POST' })
      if (res.ok) {
        const data: Recommendation[] = await res.json()
        setPicks(data)
      } else {
        const { data: books } = await supabase.from('books').select('*').eq('user_id', user.id)
        setPicks(getRecommendations((books as Book[]) ?? []))
      }
    } catch {
      const { data: books } = await supabase.from('books').select('*').eq('user_id', user.id)
      setPicks(getRecommendations((books as Book[]) ?? []))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPicks() }, [fetchPicks])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">AI Picks</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPicks}
            className="text-gray-400 hover:text-black transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/for-you"
            className="text-xs font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-0.5"
          >
            See More <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      <div className="relative flex items-center gap-2">
        <button
          onClick={() => scroll('left')}
          className="shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          aria-label="Previous cards"
        >
          ‹
        </button>

        <div
          ref={scrollRef}
          className="flex-1 flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide"
        >
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-[180px] h-[280px] shrink-0 snap-start bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                  <div className="w-full aspect-[2/3] bg-gray-100 rounded-xl mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              ))
            : picks.map((pick) => (
                <div key={pick.title} className="shrink-0 snap-start">
                  <RecommendationCard rec={pick} onAdded={fetchPicks} />
                </div>
              ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          aria-label="Next cards"
        >
          ›
        </button>
      </div>
    </div>
  )
}
