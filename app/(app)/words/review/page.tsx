'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { WordEntry } from '@/lib/types'

export default function WordReviewPage() {
  const [words, setWords] = useState<WordEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const fetchWords = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('word_bank')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      // Shuffle for variety
      const shuffled = [...((data as WordEntry[]) ?? [])].sort(() => Math.random() - 0.5)
      setWords(shuffled)
      setLoading(false)
    }
    fetchWords()
  }, [])

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, words.length - 1))
    setRevealed(false)
  }, [words.length])

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0))
    setRevealed(false)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === ' ' || e.key === 'Enter') setRevealed(true)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  const current = words[index]

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-full h-64 bg-white rounded-2xl animate-pulse border border-gray-100" />
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto text-center py-20 text-gray-400">
        <p className="text-lg mb-2">No words to review</p>
        <p className="text-sm mb-6">Add some words to your Word Bank first.</p>
        <Link href="/words" className="text-sm font-medium text-black underline">
          Go to Word Bank
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/words"
          className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Word Bank
        </Link>
        <span className="text-xs text-gray-400 tabular-nums">{index + 1} / {words.length}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 min-h-[280px] flex flex-col items-center justify-center text-center mb-6">
        {current.part_of_speech && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full mb-4"
            style={{ backgroundColor: '#f3e8ff', color: '#800080' }}
          >
            {current.part_of_speech}
          </span>
        )}

        <h2 className="font-serif font-bold text-4xl mb-6">{current.word}</h2>

        {revealed ? (
          <div className="space-y-3 max-w-md">
            <p className="text-gray-700 text-sm leading-relaxed">
              {current.definition ?? 'No definition saved.'}
            </p>
            {current.example_sentence && (
              <p className="text-xs text-gray-500 italic leading-relaxed">
                &ldquo;{current.example_sentence}&rdquo;
              </p>
            )}
            {current.etymology && (
              <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-2">{current.etymology}</p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors border border-gray-200 rounded-xl px-4 py-2 hover:border-gray-400"
          >
            <Eye size={14} /> Reveal definition
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={16} /> Previous
        </button>
        <button
          onClick={goNext}
          disabled={index === words.length - 1}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next <ArrowRight size={16} />
        </button>
      </div>

      <p className="text-center text-xs text-gray-300 mt-6">
        ← → to navigate · Space or Enter to reveal
      </p>
    </div>
  )
}
