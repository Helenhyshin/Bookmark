'use client'

import { useState } from 'react'
import { X, Star, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Book } from '@/lib/types'

type Status = 'reading' | 'want_to_read' | 'completed'

interface BookDetailProps {
  book: Book
  onClose: () => void
  onUpdated: () => void
}

export default function BookDetail({ book, onClose, onUpdated }: BookDetailProps) {
  const [status, setStatus] = useState<Status>(book.status)
  const [isFavorite, setIsFavorite] = useState(book.is_favorite)
  const [synopsis, setSynopsis] = useState(book.synopsis ?? '')
  const [genre, setGenre] = useState(book.genre ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('books')
      .update({ status, is_favorite: isFavorite, synopsis, genre })
      .eq('id', book.id)
    setSaving(false)
    onUpdated()
    onClose()
  }

  const deleteBook = async () => {
    if (!confirm('Delete this book?')) return
    const supabase = createClient()
    await supabase.from('books').delete().eq('id', book.id)
    onUpdated()
    onClose()
  }

  const statusOptions: { value: Status; label: string }[] = [
    { value: 'reading', label: 'Reading' },
    { value: 'want_to_read', label: 'Want to Read' },
    { value: 'completed', label: 'Completed' },
  ]

  const panel = (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-12 h-16 rounded-lg shadow object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div
              className="w-12 h-16 rounded-lg shadow"
              style={{ backgroundColor: book.cover_color ?? '#8B7355' }}
            />
          )}
          <div>
            <h2 className="font-serif font-bold text-lg leading-tight">{book.title}</h2>
            {book.author && <p className="text-sm text-gray-500">{book.author}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsFavorite(!isFavorite)} className="text-gray-400 hover:text-[#D4AF37] transition-colors">
            <Star size={18} className={isFavorite ? 'text-[#D4AF37] fill-[#D4AF37]' : ''} />
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Genre */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Genre</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="e.g. Literary Fiction"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Status</label>
          <div className="flex gap-2">
            {statusOptions.map(({ value, label }) => (
              <button
                key={value}
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

        {/* Synopsis */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Synopsis</label>
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            rows={4}
            placeholder="Add a synopsis or personal notes…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-5">
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 bg-black text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-gray-900 transition-colors"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          onClick={deleteBook}
          className="px-3 text-red-400 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile: full-screen modal */}
      <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:hidden" onClick={onClose}>
        <div className="w-full max-h-[90vh] overflow-y-auto rounded-t-3xl" onClick={(e) => e.stopPropagation()}>
          {panel}
        </div>
      </div>

      {/* Desktop: inline panel */}
      <div className="hidden md:block col-span-4 mt-1">{panel}</div>
    </>
  )
}
