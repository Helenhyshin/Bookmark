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
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-12 h-16 rounded-lg shrink-0 shadow object-cover"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div
            className="w-12 h-16 rounded-lg shrink-0 shadow"
            style={{ backgroundColor: book.cover_color ?? '#8B7355' }}
          />
        )}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif font-semibold text-sm leading-tight line-clamp-3 min-w-0">{book.title}</h3>
            {book.is_favorite && <Star size={14} className="text-[#D4AF37] fill-[#D4AF37] shrink-0" />}
          </div>
          {book.author && <p className="text-xs text-gray-500 mt-0.5 line-clamp-3 min-w-0">{book.author}</p>}
          <div className="flex items-center gap-2 mt-2">
            {book.genre && (
              <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {book.genre.replace(/_/g, ' ')}
              </span>
            )}
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[book.status]}`}>
              {STATUS_LABELS[book.status]}
            </span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-[180px] shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-gray-300 hover:-translate-y-0.5 transition-all text-left flex flex-col"
    >
      {/* Cover - fixed aspect */}
      <div
        className="relative w-full rounded-lg shadow mb-2 shrink-0 overflow-hidden"
        style={{ backgroundColor: book.cover_color ?? '#8B7355', aspectRatio: '2/3' }}
      >
        {book.cover_image_url && (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        )}
        {book.is_favorite && (
          <Star size={14} className="absolute top-2 right-2 text-[#D4AF37] fill-[#D4AF37]" />
        )}
      </div>

      {/* Genre badge - fixed height */}
      <div className="h-5 flex items-center shrink-0 mb-1 overflow-hidden">
        {book.genre && (
          <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full whitespace-nowrap truncate max-w-full">
            {book.genre.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      <div className="h-9 flex items-start shrink-0 overflow-hidden">
        <h3 className="font-serif font-semibold text-xs leading-tight line-clamp-3">{book.title}</h3>
      </div>
      <div className="h-5 flex items-center shrink-0 overflow-hidden">
        {book.author && <p className="text-[11px] text-gray-500 line-clamp-1 truncate">{book.author}</p>}
      </div>

      {/* Status - fixed height */}
      <div className="h-6 flex items-center shrink-0">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[book.status]}`}>
          {STATUS_LABELS[book.status]}
        </span>
      </div>
    </button>
  )
}
