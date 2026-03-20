'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import RecommendationCard from '@/components/for-you/RecommendationCard'
import type { NYTBook, NYTListKey } from '@/app/api/nyt-bestsellers/route'
import type { Recommendation } from '@/lib/types'

const COVER_COLORS = ['#8B7355', '#2C3E50', '#1A472A', '#6B4226', '#3B3B6D', '#8E4B2E', '#5C4033', '#2E4057']

const LISTS: { key: NYTListKey; label: string }[] = [
  { key: 'hardcover-fiction',    label: 'HC Fiction' },
  { key: 'hardcover-nonfiction', label: 'HC Nonfiction' },
  { key: 'paperback-fiction',    label: 'PB Fiction' },
  { key: 'paperback-nonfiction', label: 'PB Nonfiction' },
]

const CARD_WIDTH = 180
const CARD_GAP = 16
const SCROLL_AMOUNT = (CARD_WIDTH + CARD_GAP) * 3

function nytToRec(book: NYTBook, index: number): Recommendation {
  return {
    title: book.title,
    author: book.author,
    genre: book.description,
    coverColor: COVER_COLORS[index % COVER_COLORS.length],
    coverImageUrl: book.coverUrl ?? undefined,
    reason: book.weeksOnList > 1 ? `${book.weeksOnList} weeks on the list` : 'New to the list',
  }
}

export default function NYTBestsellers() {
  const [activeList, setActiveList] = useState<NYTListKey>('hardcover-fiction')
  const [books, setBooks] = useState<NYTBook[]>([])
  const [libraryTitles, setLibraryTitles] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cache = useRef<Partial<Record<NYTListKey, NYTBook[]>>>({})

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT, behavior: 'smooth' })
  }, [])

  const fetchList = useCallback(async (list: NYTListKey) => {
    if (cache.current[list]) {
      setBooks(cache.current[list]!)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/nyt-bestsellers?list=${list}`)
      if (!res.ok) throw new Error()
      const data: NYTBook[] = await res.json()
      cache.current[list] = data
      setBooks(data)
    } catch {
      setError(true)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch library titles once for "In your library" state
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('books').select('title').eq('user_id', user.id).then(({ data }) => {
        if (data) setLibraryTitles(new Set(data.map((b) => b.title.toLowerCase())))
      })
    })
  }, [])

  useEffect(() => {
    fetchList(activeList)
    // Reset scroll position when switching lists
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
  }, [activeList, fetchList])

  const handleAdded = useCallback((title: string) => {
    setLibraryTitles((prev) => new Set([...prev, title.toLowerCase()]))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">NYT Bestsellers</h2>
      </div>

      {/* List tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {LISTS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveList(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeList === key
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
          <p className="text-sm text-stone-500">Could not load bestsellers — try again later.</p>
        </div>
      )}

      {!error && (
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            aria-label="Previous"
          >
            ‹
          </button>

          <div
            ref={scrollRef}
            className="flex-1 flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide"
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-[180px] shrink-0 snap-start bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse flex flex-col gap-2">
                    <div className="w-full bg-gray-100 rounded-lg" style={{ aspectRatio: '2/3' }} />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                    <div className="h-7 bg-gray-100 rounded-lg mt-auto" />
                  </div>
                ))
              : books.map((book, i) => (
                  <div key={book.rank} className="shrink-0 snap-start self-stretch">
                    <RecommendationCard
                      rec={nytToRec(book, i)}
                      rank={book.rank}
                      isInLibrary={libraryTitles.has(book.title.toLowerCase())}
                      onAdded={() => handleAdded(book.title)}
                    />
                  </div>
                ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
