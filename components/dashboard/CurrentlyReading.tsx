'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Book } from '@/lib/types'

export default function CurrentlyReading() {
  const [book, setBook] = useState<Book | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchCurrentBook = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'reading')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) setBook(data)
    }
    fetchCurrentBook()
  }, [])

  const updateProgress = async (progress: number) => {
    if (!book) return
    const supabase = createClient()
    await supabase.from('books').update({ progress }).eq('id', book.id)
    setBook({ ...book, progress })
  }

  const saveNote = async () => {
    if (!book || !note.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('inspirations').insert({
      user_id: book.user_id,
      type: 'passage',
      content: note,
      source: book.title,
      color_border: 'purple',
    })
    setNote('')
    setSaving(false)
  }

  if (!book) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 text-gray-400">
        <BookOpen size={32} />
        <div>
          <p className="font-medium text-gray-700">Not currently reading</p>
          <p className="text-sm">Add a book and mark it as Reading to track progress here.</p>
        </div>
      </div>
    )
  }

  const pagesEstimate = Math.round(((100 - book.progress) / 100) * 280)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start gap-4">
        {/* Cover */}
        <div
          className="w-14 h-20 rounded-lg shrink-0 shadow"
          style={{ backgroundColor: book.cover_color ?? '#8B7355' }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Currently Reading</p>
          <h3 className="font-serif font-semibold text-lg leading-tight truncate">{book.title}</h3>
          {book.author && <p className="text-sm text-gray-500">{book.author}</p>}

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{book.progress}% complete</span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> ~{pagesEstimate} pages left
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={book.progress}
              onChange={(e) => updateProgress(Number(e.target.value))}
              className="w-full h-1.5 accent-black rounded-full cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Quick note */}
      <div className="mt-4 flex gap-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Jot a quick note or passage…"
          rows={2}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          onClick={saveNote}
          disabled={saving || !note.trim()}
          className="bg-black text-white text-xs font-medium px-3 rounded-lg disabled:opacity-40 hover:bg-gray-900 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )
}
