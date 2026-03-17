'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

const CARD_WIDTH = 180
const CARD_GAP = 16
const SCROLL_AMOUNT = (CARD_WIDTH + CARD_GAP) * 3
import { createClient } from '@/lib/supabase/client'
import { getRecommendations, getPatternChips } from '@/lib/ai-helpers'
import PatternChips from '@/components/for-you/PatternChips'
import RecommendationCard from '@/components/for-you/RecommendationCard'
import AuthorPanel from '@/components/for-you/AuthorPanel'
import type { Book, Recommendation } from '@/lib/types'

export default function ForYouPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [chips, setChips] = useState<string[]>([])
  const [booksLoading, setBooksLoading] = useState(true)
  const [recsLoading, setRecsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const offset = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT
    el.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const fetchRecs = useCallback(async (userBooks: Book[]) => {
    setRecsLoading(true)
    try {
      const res = await fetch('/api/recommendations', { method: 'POST' })
      if (res.ok) {
        const data: Recommendation[] = await res.json()
        setRecs(data)
      } else {
        setRecs(getRecommendations(userBooks))
      }
    } catch {
      setRecs(getRecommendations(userBooks))
    } finally {
      setRecsLoading(false)
    }
  }, [])

  const fetchData = useCallback(async () => {
    setBooksLoading(true)
    setRecsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setBooksLoading(false); setRecsLoading(false); return }

    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id)

    const userBooks = (data as Book[]) ?? []
    setBooks(userBooks)
    setChips(getPatternChips(userBooks))
    setBooksLoading(false)

    fetchRecs(userBooks)
  }, [fetchRecs])

  useEffect(() => { fetchData() }, [fetchData])

  const isRefreshing = booksLoading || recsLoading

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-8">
      {/* AI Recommendations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Recommended for You</h2>
          <button
            onClick={fetchData}
            className="text-gray-400 hover:text-black transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {!booksLoading && <PatternChips chips={chips} />}

        {recsLoading ? (
          <div className="relative flex items-center gap-2">
            <div className="w-10 shrink-0" />
            <div className="flex-1 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-[180px] h-[280px] shrink-0 snap-start bg-white rounded-2xl animate-pulse border border-gray-100" />
              ))}
            </div>
            <div className="w-10 shrink-0" />
          </div>
        ) : (
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
              className="flex-1 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
            >
              {recs.map((rec) => (
                <div key={rec.title} className="shrink-0 snap-start">
                  <RecommendationCard rec={rec} onAdded={fetchData} />
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
        )}
      </section>

      {/* Favourite authors */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Favourite Authors</h2>
        {booksLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <AuthorPanel books={books} />
        )}
      </section>
    </div>
  )
}
