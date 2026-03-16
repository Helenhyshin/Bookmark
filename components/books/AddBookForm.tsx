'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Plus, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { BookSuggestion } from '@/app/api/books/suggest/route'

const COVER_COLORS = ['#8B7355', '#2C3E50', '#1A472A', '#6B4226', '#3B3B6D', '#8E4B2E', '#5C4033', '#2E4057']

interface AddBookFormProps {
  onAdded: () => void
}

export default function AddBookForm({ onAdded }: AddBookFormProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [selected, setSelected] = useState<BookSuggestion | null>(null)
  const [status, setStatus] = useState<'want_to_read' | 'reading' | 'completed'>('want_to_read')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    if (query.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return }

    debounce.current = setTimeout(async () => {
      setFetching(true)
      try {
        const res = await fetch(`/api/books/suggest?q=${encodeURIComponent(query.trim())}`)
        if (res.ok) {
          const list: BookSuggestion[] = await res.json()
          setSuggestions(list)
          setShowSuggestions(list.length > 0)
        }
      } catch { /* silent */ } finally {
        setFetching(false)
      }
    }, 250)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectSuggestion = (s: BookSuggestion) => {
    setSelected(s)
    setQuery(s.title)
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const clearSelection = () => {
    setSelected(null)
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const randomColor = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)]
      const { error: insertError } = await supabase.from('books').insert({
        user_id: user.id,
        title: selected?.title ?? query.trim(),
        author: selected?.author ?? null,
        genre: selected?.genre ?? null,
        cover_image_url: selected?.coverUrl ?? null,
        cover_color: randomColor,
        status,
      })
      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }
      setQuery('')
      setSelected(null)
      setSuggestions([])
      onAdded()
    }
    setSaving(false)
  }

  const statusOptions = [
    { value: 'want_to_read' as const, label: 'Want to Read' },
    { value: 'reading' as const, label: 'Reading' },
    { value: 'completed' as const, label: 'Completed' },
  ]

  return (
    <form onSubmit={handleAdd} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700">Add a book</h3>

      {/* Search input + suggestions */}
      <div className="relative" ref={containerRef}>
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); setShowSuggestions(true) }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search by title…"
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {fetching && <Loader2 size={14} className="text-gray-400 animate-spin" />}
          {query && !fetching && (
            <button type="button" onClick={clearSelection} className="text-gray-300 hover:text-gray-500 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s) }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  {s.coverUrl ? (
                    <img
                      src={s.coverUrl}
                      alt=""
                      className="w-8 h-11 rounded object-cover shrink-0 shadow-sm"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-8 h-11 rounded bg-gray-200 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    {s.author && <p className="text-xs text-gray-400 truncate">{s.author}</p>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected book preview */}
      {selected && (
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          {selected.coverUrl ? (
            <img
              src={selected.coverUrl}
              alt={selected.title}
              className="w-10 h-14 rounded object-cover shadow"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-10 h-14 rounded bg-gray-300" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{selected.title}</p>
            {selected.author && <p className="text-xs text-gray-500">{selected.author}</p>}
            {selected.genre && <p className="text-[10px] text-gray-400 mt-0.5">{selected.genre}</p>}
          </div>
        </div>
      )}

      {/* Status */}
      <div>
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Status</label>
        <div className="flex gap-2">
          {statusOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                status === value ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving || !query.trim()}
        className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-gray-900 transition-colors"
      >
        <Plus size={16} />
        {saving ? 'Adding…' : 'Add to Library'}
      </button>
    </form>
  )
}
