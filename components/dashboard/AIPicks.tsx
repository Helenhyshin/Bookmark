'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import RecommendationCard from '@/components/for-you/RecommendationCard'
import type { Recommendation } from '@/lib/types'

const CARD_WIDTH = 180
const CARD_GAP = 16
const SCROLL_AMOUNT = (CARD_WIDTH + CARD_GAP) * 3

export default function AIPicks() {
  const [picks, setPicks] = useState<Recommendation[]>([])
  const [libraryTitles, setLibraryTitles] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [libraryChanged, setLibraryChanged] = useState(false)
  const [error, setError] = useState<'generation_failed' | 'no_books' | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const offset = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT
    el.scrollBy({ left: offset, behavior: 'smooth' })
  }, [])

  // Keyboard navigation for the carousel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowLeft') scroll('left')
      else if (e.key === 'ArrowRight') scroll('right')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [scroll])

  const fetchPicks = useCallback(async (force = false) => {
    if (force) setRefreshing(true)
    else setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); setRefreshing(false); return }

    try {
      const [recRes, { data: bookData }] = await Promise.all([
        fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force }),
        }),
        supabase.from('books').select('title').eq('user_id', user.id),
      ])

      setLibraryTitles(new Set((bookData ?? []).map((b) => b.title.toLowerCase())))

      const data = await recRes.json()
      if (recRes.ok) {
        if (data.noBooks) {
          setError('no_books')
          setPicks([])
        } else {
          setError(null)
          setPicks(data.recommendations)
          setLibraryChanged(data.libraryChanged ?? false)
        }
      } else {
        setError('generation_failed')
        setPicks([])
      }
    } catch {
      setError('generation_failed')
      setPicks([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchPicks() }, [fetchPicks])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">AI Picks</h2>
        {libraryChanged ? (
          <button
            onClick={() => fetchPicks(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-medium text-black hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Updating…' : 'Library changed — update picks'}
          </button>
        ) : (
          <button
            onClick={() => fetchPicks(true)}
            className="text-gray-400 hover:text-black transition-colors"
            title="Refresh recommendations"
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {!loading && error === 'no_books' && (
        <p className="text-sm text-gray-400 py-4">Add some books to your library to get personalised recommendations.</p>
      )}

      {!loading && error === 'generation_failed' && (
        <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
          <p className="text-sm text-stone-500">Recommendations unavailable — try again later.</p>
          <button
            onClick={() => fetchPicks(true)}
            disabled={refreshing}
            className="text-xs font-medium text-black hover:underline shrink-0 ml-4 disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}

      {(loading || (!error && picks.length > 0)) && (
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
                  <div key={i} className="w-[180px] shrink-0 snap-start bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse flex flex-col gap-2">
                    <div className="w-full bg-gray-100 rounded-lg" style={{ aspectRatio: '2/3' }} />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                    <div className="h-7 bg-gray-100 rounded-lg mt-auto" />
                  </div>
                ))
              : picks.map((pick) => (
                  <div key={pick.title} className="shrink-0 snap-start self-stretch">
                    <RecommendationCard
                      rec={pick}
                      isInLibrary={libraryTitles.has(pick.title.toLowerCase())}
                      onAdded={fetchPicks}
                    />
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
    </div>
  )
}
