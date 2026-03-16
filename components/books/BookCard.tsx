'use client'

import { Star } from 'lucide-react'
import type { Book } from '@/lib/types'

const STATUS_LABELS = {
  reading: 'Reading',
  want_to_read: 'To Read',
  completed: 'Done',
}

const STATUS_COLORS = {
  reading: 'bg-blue-50 text-blue-700',
  want_to_read: 'bg-gray-100 text-gray-600',
  completed: 'bg-green-50 text-green-700',
}

interface BookCardProps {
  book: Book
  onClick: () => void
  view: 'grid' | 'list'
}

export default function BookCard({ book, onClick, view }: BookCardProps) {
  if (view === 'list') {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-gray-300 transition-all text-left"
      >
        <div
          className="w-12 h-16 rounded-lg shrink-0 shadow"
          style={{ backgroundColor: book.cover_color ?? '#8B7355' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif font-semibold text-sm leading-tight truncate">{book.title}</h3>
            {book.is_favorite && <Star size={14} className="text-[#D4AF37] fill-[#D4AF37] shrink-0" />}
          </div>
          {book.author && <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>}
          <div className="flex items-center gap-2 mt-2">
            {book.genre && (
              <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {book.genre}
              </span>
            )}
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[book.status]}`}>
              {STATUS_LABELS[book.status]}
            </span>
          </div>
          {book.synopsis && (
            <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{book.synopsis}</p>
          )}
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-gray-300 hover:-translate-y-0.5 transition-all text-left"
    >
      {/* Cover */}
      <div className="relative mb-3">
        <div
          className="w-full h-36 rounded-xl shadow"
          style={{ backgroundColor: book.cover_color ?? '#8B7355' }}
        />
        {book.is_favorite && (
          <Star size={14} className="absolute top-2 right-2 text-[#D4AF37] fill-[#D4AF37]" />
        )}
      </div>

      {/* Genre badge */}
      {book.genre && (
        <span className="inline-block text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mb-1.5">
          {book.genre}
        </span>
      )}

      <h3 className="font-serif font-semibold text-sm leading-tight line-clamp-2">{book.title}</h3>
      {book.author && <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>}

      {/* Synopsis snippet */}
      {book.synopsis && (
        <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{book.synopsis}</p>
      )}

      {/* Status */}
      <span className={`inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[book.status]}`}>
        {STATUS_LABELS[book.status]}
      </span>
    </button>
  )
}
