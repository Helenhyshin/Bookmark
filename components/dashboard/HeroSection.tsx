'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Plus, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Book } from '@/lib/types'

interface Stats {
  booksRead: number
  completed: number
  wordsAdded: number
}

interface WordOfDay {
  word: string
  definition: string | null
  partOfSpeech: string | null
}

const QUOTES = [
  { text: 'A reader lives a thousand lives. The man who never reads lives only one.', author: 'George R.R. Martin' },
  { text: 'So many books, so little time.', author: 'Frank Zappa' },
  { text: 'A room without books is like a body without a soul.', author: 'Cicero' },
  { text: 'I have always imagined that Paradise will be a kind of library.', author: 'Borges' },
]

function getTodaysQuote() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const day = Math.floor((now.getTime() - start.getTime()) / 86_400_000)
  return QUOTES[day % QUOTES.length]
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded bg-gray-200 ${className ?? ''}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export default function HeroSection() {
  const [username, setUsername] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({ booksRead: 0, completed: 0, wordsAdded: 0 })
  const [currentBook, setCurrentBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [wordOfDay, setWordOfDay] = useState<WordOfDay | null>(null)
  const [wordAdded, setWordAdded] = useState(false)
  const [wordSaving, setWordSaving] = useState(false)
  const quote = getTodaysQuote()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()

      // Fire auth + word-of-the-day in parallel
      const [authResult, wordRes] = await Promise.all([
        supabase.auth.getUser(),
        fetch('/api/word-of-the-day').catch(() => null),
      ])

      // Process word of the day immediately
      if (wordRes?.ok) {
        try { setWordOfDay(await wordRes.json()) } catch { /* silent */ }
      }

      const user = authResult.data?.user
      if (!user) { setLoading(false); return }

      // Fire all Supabase queries in parallel
      const [profile, books, words] = await Promise.all([
        supabase.from('profiles').select('username').eq('id', user.id).single(),
        supabase.from('books').select('*').eq('user_id', user.id),
        supabase.from('word_bank').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ])

      if (profile.data?.username) setUsername(profile.data.username)

      const allBooks = (books.data as Book[]) ?? []
      setStats({
        booksRead: allBooks.length,
        completed: allBooks.filter((b) => b.status === 'completed').length,
        wordsAdded: words.count ?? 0,
      })

      const reading = allBooks
        .filter((b) => b.status === 'reading')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      if (reading.length > 0) setCurrentBook(reading[0])
      setLoading(false)
    }
    load()
  }, [])

  const addToWordBank = async () => {
    if (wordSaving || wordAdded || !wordOfDay) return
    setWordSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('word_bank').insert({
        user_id: user.id,
        word: wordOfDay.word,
        definition: wordOfDay.definition ?? null,
        part_of_speech: wordOfDay.partOfSpeech ?? null,
      })
      setWordAdded(true)
    }
    setWordSaving(false)
  }

  const statItems = [
    { label: 'Books', value: stats.booksRead, href: '/books' },
    { label: 'Done', value: stats.completed, href: '/books?filter=completed' },
    { label: 'Words', value: stats.wordsAdded, href: '/words' },
  ]

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 md:p-6">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            {loading ? (
              <>
                <Skeleton className="h-6 w-48 mb-1.5" />
                <Skeleton className="h-3 w-36" />
              </>
            ) : (
              <>
                <h1 className="font-serif text-lg md:text-xl font-semibold text-gray-900">
                  Welcome back, {username ? username : 'Scholar'}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">Your literary journey continues.</p>
              </>
            )}
          </div>
          <div className="flex gap-5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-2.5 w-8 mx-auto mb-1.5" />
                  <Skeleton className="h-5 w-6 mx-auto" />
                </div>
              ))
            ) : (
              statItems.map(({ label, value, href }) => (
                <Link key={label} href={href} className="text-center hover:opacity-70 transition-opacity">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                  <p className="text-lg font-serif font-semibold text-gray-900">{value}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Cards row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Currently Reading card */}
          {loading ? (
            <div className="rounded-xl bg-gray-100 min-h-[140px] p-3.5 flex items-end gap-3">
              <Skeleton className="w-10 h-14 rounded-md shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-2 w-20 mb-2" />
                <Skeleton className="h-4 w-32 mb-1.5" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
          ) : currentBook ? (
            <div className="relative rounded-xl overflow-hidden min-h-[140px] flex flex-col justify-end">
              <div className="absolute inset-0">
                {currentBook.cover_image_url ? (
                  <img
                    src={currentBook.cover_image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: currentBook.cover_color ?? '#8B7355' }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/10" />
              </div>
              <div className="relative p-3.5 flex items-end gap-3">
                {currentBook.cover_image_url ? (
                  <img
                    src={currentBook.cover_image_url}
                    alt={currentBook.title}
                    className="w-10 h-14 rounded-md shrink-0 shadow object-cover border border-white/10"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div
                    className="w-10 h-14 rounded-md shrink-0 shadow border border-white/10"
                    style={{ backgroundColor: currentBook.cover_color ?? '#8B7355' }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-[#D4AF37] mb-0.5">Currently Reading</p>
                  <h3 className="font-serif text-sm font-semibold text-white leading-tight line-clamp-1">{currentBook.title}</h3>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    {currentBook.author}
                    {currentBook.progress > 0 && <span> &bull; {currentBook.progress}%</span>}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/books"
              className="rounded-xl min-h-[140px] flex flex-col items-center justify-center bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <p className="text-gray-400 text-xs mb-1.5">No book in progress</p>
              <span className="inline-flex items-center gap-1 bg-black text-white text-[11px] font-medium px-3 py-1.5 rounded-full">
                Start Reading <ArrowRight size={11} />
              </span>
            </Link>
          )}

          {/* Word of the Day card */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-3.5 flex flex-col justify-between min-h-[140px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">Word of the Day</p>
                {wordOfDay && !loading && (
                  <button
                    onClick={addToWordBank}
                    disabled={wordSaving || wordAdded}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-black hover:text-gray-600 transition-colors disabled:opacity-40"
                  >
                    {wordSaving ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : wordAdded ? (
                      <><Check size={10} /> Added</>
                    ) : (
                      <><Plus size={10} /> Add to Bank</>
                    )}
                  </button>
                )}
              </div>

              {loading ? (
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ) : wordOfDay ? (
                <>
                  <h3 className="font-serif text-xl font-semibold text-gray-900 mb-0.5">{wordOfDay.word}</h3>
                  {wordOfDay.definition && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {wordOfDay.definition}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-400 italic">Unavailable today.</p>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-[11px] text-gray-400 italic leading-relaxed line-clamp-2">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-[10px] text-gray-300 mt-0.5">&mdash; {quote.author}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
