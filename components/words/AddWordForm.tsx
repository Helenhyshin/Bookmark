'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Book } from '@/lib/types'

interface Meaning {
  partOfSpeech: string
  definitions: string[]
}

interface DictResult {
  word: string
  definition: string | null
  partOfSpeech: string | null
  etymology: string | null
  meanings: Meaning[]
}

interface AddWordFormProps {
  onAdded: () => void
  books: Book[]
}

export default function AddWordForm({ onAdded, books }: AddWordFormProps) {
  const [word, setWord] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [def, setDef] = useState<DictResult | null>(null)
  const [fetchingDef, setFetchingDef] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [bookSourceId, setBookSourceId] = useState('')
  const [saving, setSaving] = useState(false)
  const suggestDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const defDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Suggestions — fast, 250ms debounce
  useEffect(() => {
    if (suggestDebounce.current) clearTimeout(suggestDebounce.current)
    if (word.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return }

    suggestDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/dictionary/suggest?q=${encodeURIComponent(word.trim())}`)
        if (res.ok) {
          const list: string[] = await res.json()
          setSuggestions(list)
          setShowSuggestions(list.length > 0)
        }
      } catch { /* silent */ }
    }, 250)
  }, [word])

  // Definition — slower, 700ms debounce, fires after suggestion selection too
  const fetchDefinition = async (w: string) => {
    if (!w.trim() || w.trim().length < 2) return
    setFetchingDef(true)
    setNotFound(false)
    setDef(null)
    try {
      const res = await fetch(`/api/dictionary?word=${encodeURIComponent(w.trim())}`)
      if (res.ok) {
        setDef(await res.json())
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
    } finally {
      setFetchingDef(false)
    }
  }

  useEffect(() => {
    if (defDebounce.current) clearTimeout(defDebounce.current)
    if (word.trim().length < 2) { setDef(null); setNotFound(false); return }

    defDebounce.current = setTimeout(() => fetchDefinition(word), 700)
  }, [word])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectSuggestion = (w: string) => {
    setWord(w)
    setSuggestions([])
    setShowSuggestions(false)
    fetchDefinition(w)
    inputRef.current?.focus()
  }

  const clearWord = () => {
    setWord('')
    setDef(null)
    setNotFound(false)
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

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
      setNotFound(false)
      setSuggestions([])
      setBookSourceId('')
      onAdded()
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleAdd} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Add a word</h3>

      {/* Word input + suggestions */}
      <div className="relative" ref={containerRef}>
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
        <input
          ref={inputRef}
          type="text"
          value={word}
          onChange={(e) => { setWord(e.target.value); setShowSuggestions(true) }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Type a word…"
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {fetchingDef && <Loader2 size={14} className="text-gray-400 animate-spin" />}
          {word && !fetchingDef && (
            <button type="button" onClick={clearWord} className="text-gray-300 hover:text-gray-500 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s) }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Search size={12} className="text-gray-300 shrink-0" />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Not found */}
      {notFound && word.length >= 2 && (
        <p className="text-xs text-gray-400 italic">No definition found for &ldquo;{word}&rdquo; — you can still save it.</p>
      )}

      {/* Definition preview — all meanings */}
      {def && (
        <div className="space-y-3 rounded-xl bg-gray-50 p-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{def.word}</p>

          {def.meanings.length > 0 ? (
            def.meanings.map((m, i) => (
              <div key={i}>
                <span className="inline-block text-[10px] font-semibold text-[#800080] bg-[#800080]/10 px-2 py-0.5 rounded-full mb-1 capitalize">
                  {m.partOfSpeech}
                </span>
                <ol className="space-y-1">
                  {m.definitions.map((d, j) => (
                    <li key={j} className="text-sm text-gray-700 leading-relaxed">
                      {m.definitions.length > 1 && (
                        <span className="text-gray-400 text-xs mr-1">{j + 1}.</span>
                      )}
                      {d}
                    </li>
                  ))}
                </ol>
              </div>
            ))
          ) : (
            def.definition && <p className="text-sm text-gray-700">{def.definition}</p>
          )}

          {def.etymology && (
            <p className="text-xs text-gray-400 italic leading-relaxed border-t border-gray-200 pt-2">
              <span className="font-semibold not-italic text-gray-500">Origin: </span>
              {def.etymology}
            </p>
          )}
        </div>
      )}

      {/* Book source */}
      {books.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
            Found in book
          </label>
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
