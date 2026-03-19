'use client'

import { useEffect, useState } from 'react'
import { BookMarked, Plus, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface WordOfTheDayResult {
  word: string
  definition: string | null
  partOfSpeech: string | null
  note: string | null
}

export default function WordOfTheDay() {
  const [data, setData] = useState<WordOfTheDayResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchWord = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/word-of-the-day')
        if (res.ok) setData(await res.json())
      } catch { /* silent */ }
      setLoading(false)
    }
    fetchWord()
  }, [])

  const addToWordBank = async () => {
    if (saving || added || !data) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('word_bank').insert({
        user_id: user.id,
        word: data.word,
        definition: data.definition ?? null,
        part_of_speech: data.partOfSpeech ?? null,
      })
      setAdded(true)
    }
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookMarked size={16} className="text-[#800080]" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Word of the Day</p>
        </div>
        <button
          onClick={addToWordBank}
          disabled={saving || added || loading || !data}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40
            bg-black text-white hover:bg-gray-900 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : added ? (
            <><Check size={13} /> Added</>
          ) : (
            <><Plus size={13} /> Add to Word Bank</>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : !data ? (
        <p className="text-sm text-gray-400 italic">Word of the day unavailable.</p>
      ) : (
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <h3 className="font-serif text-2xl font-semibold text-gray-900">{data.word}</h3>
            {data.partOfSpeech && (
              <span className="text-[11px] font-semibold text-[#800080] bg-[#800080]/10 px-2 py-0.5 rounded-full capitalize">
                {data.partOfSpeech}
              </span>
            )}
          </div>
          {data.definition ? (
            <p className="text-sm text-gray-600 leading-relaxed">{data.definition}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Definition unavailable.</p>
          )}
          {data.note && (
            <p className="text-xs text-gray-400 italic mt-2 leading-relaxed">{data.note}</p>
          )}
        </div>
      )}
    </div>
  )
}
