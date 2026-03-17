'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AlphaNav from '@/components/words/AlphaNav'
import AddWordForm from '@/components/words/AddWordForm'
import WordCard from '@/components/words/WordCard'
import type { WordEntry, Book } from '@/lib/types'

export default function WordsPage() {
  const [words, setWords] = useState<WordEntry[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [wordRes, bookRes] = await Promise.all([
      supabase.from('word_bank').select('*').eq('user_id', user.id).order('word'),
      supabase.from('books').select('id, title').eq('user_id', user.id).order('title'),
    ])

    setWords((wordRes.data as WordEntry[]) ?? [])
    setBooks((bookRes.data as Book[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Group words by first letter
  const grouped = words.reduce<Record<string, WordEntry[]>>((acc, w) => {
    const letter = w.word[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(w)
    return acc
  }, {})

  const activeLetters = new Set(Object.keys(grouped))

  const bookMap = Object.fromEntries(books.map((b) => [b.id, b.title]))

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Alpha nav */}
      <div className="mb-5">
        <AlphaNav activeLetters={activeLetters} />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Add form */}
        <div className="md:w-72 shrink-0">
          <AddWordForm onAdded={fetchData} books={books} />
        </div>

        {/* Words list */}
        <div className="flex-1 min-w-0">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 h-24 animate-pulse border border-gray-100" />
              ))}
            </div>
          )}

          {!loading && words.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg mb-1">No words yet</p>
              <p className="text-sm">Type a word in the form to look it up and save it.</p>
            </div>
          )}

          {!loading && Object.entries(grouped).map(([letter, letterWords]) => (
            <div key={letter} id={`letter-${letter}`} className="mb-6 scroll-mt-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pb-1 border-b border-gray-200">
                {letter}
              </h2>
              <div className="flex flex-wrap gap-3">
                {letterWords.map((word) => (
                  <WordCard
                    key={word.id}
                    word={word}
                    bookTitle={word.book_source_id ? bookMap[word.book_source_id] : undefined}
                    onDeleted={fetchData}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
