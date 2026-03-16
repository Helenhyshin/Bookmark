'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Book } from '@/lib/types'

interface DictResult {
  word: string
  definition: string | null
  partOfSpeech: string | null
  etymology: string | null
}

interface AddWordFormProps {
  onAdded: () => void
  books: Book[]
}

export default function AddWordForm({ onAdded, books }: AddWordFormProps) {
  const [word, setWord] = useState('')
  const [def, setDef] = useState<DictResult | null>(null)
  const [fetching, setFetching] = useState(false)
  const [bookSourceId, setBookSourceId] = useState('')
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (word.trim().length < 2) { setDef(null); return }

    debounceRef.current = setTimeout(async () => {
      setFetching(true)
      try {
        const res = await fetch(`/api/dictionary?word=${encodeURIComponent(word.trim())}`)
        if (res.ok) setDef(await res.json())
        else setDef(null)
      } catch {
        setDef(null)
      } finally {
        setFetching(false)
      }
    }, 600)
  }, [word])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim()) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('word_bank').insert({
        user_id: user.id,
        word: def?.word ?? word.trim(),
        definition: def?.definition ?? null,
        part_of_speech: def?.partOfSpeech ?? null,
        etymology: def?.etymology ?? null,
        book_source_id: bookSourceId || null,
      })
      setWord('')
      setDef(null)
      setBookSourceId('')
      onAdded()
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleAdd} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Add a word</h3>

      {/* Word input */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Type a word…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        {fetching && (
          <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Auto-populated fields */}
      {def && (
        <div className="space-y-3 text-sm">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Definition</label>
            <p className="mt-1 text-gray-700 leading-relaxed">{def.definition ?? '—'}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Part of Speech</label>
              <p className="mt-1 font-medium capitalize">{def.partOfSpeech ?? '—'}</p>
            </div>
          </div>
          {def.etymology && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Etymology</label>
              <p className="mt-1 text-gray-600 italic leading-relaxed">{def.etymology}</p>
            </div>
          )}
        </div>
      )}

      {/* Book source */}
      {books.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Found in book</label>
          <select
            value={bookSourceId}
            onChange={(e) => setBookSourceId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">— none —</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={saving || !word.trim()}
        className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-gray-900 transition-colors"
      >
        <Plus size={16} />
        {saving ? 'Adding…' : 'Add to Word Bank'}
      </button>
    </form>
  )
}
