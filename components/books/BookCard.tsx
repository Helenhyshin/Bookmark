'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Star, ChevronDown, Trash2 } from 'lucide-react'
import type { Book } from '@/lib/types'

const STATUS_LABELS: Record<Book['status'], string> = {
  reading: 'Reading',
  want_to_read: 'To Read',
  completed: 'Done',
}

const STATUS_COLORS: Record<Book['status'], string> = {
  reading: 'bg-blue-50 text-blue-700',
  want_to_read: 'bg-gray-100 text-gray-600',
  completed: 'bg-green-50 text-green-700',
}

const STATUS_OPTIONS: { value: Book['status']; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'want_to_read', label: 'Want to Read' },
  { value: 'completed', label: 'Completed' },
]

interface BookCardProps {
  book: Book
  onClick: () => void
  view: 'grid' | 'list'
  onStatusChange?: (status: Book['status']) => void
  onDelete?: () => void
}

function StatusDropdown({ book, onStatusChange, onOpenChange }: { book: Book; onStatusChange: (s: Book['status']) => void; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const onOpenChangeRef = useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange

  const updateOpen = useCallback((next: boolean) => {
    setOpen(next)
    onOpenChangeRef.current?.(next)
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) updateOpen(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [open, updateOpen])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); updateOpen(!open) }}
        className={`flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${STATUS_COLORS[book.status]}`}
      >
        {STATUS_LABELS[book.status]}
        <ChevronDown size={10} className="ml-0.5 opacity-60" />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[120px]">
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onStatusChange(value); updateOpen(false) }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 active:bg-gray-100 transition-colors ${value === book.status ? 'font-semibold' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BookCard({ book, onClick, view, onStatusChange, onDelete }: BookCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (view === 'list') {
    return (
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        className={`w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-gray-300 transition-all cursor-pointer relative ${dropdownOpen ? 'z-50' : 'z-0'}`}
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
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif font-semibold text-sm leading-tight line-clamp-3 min-w-0">{book.title}</h3>
            <div className="flex items-center gap-1 shrink-0">
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Delete book"
                >
                  <Trash2 size={16} strokeWidth={2} />
                </button>
              )}
              {book.is_favorite && <Star size={14} className="text-[#D4AF37] fill-[#D4AF37] shrink-0" />}
            </div>
          </div>
          {book.author && <p className="text-xs text-gray-500 mt-0.5 line-clamp-3 min-w-0">{book.author}</p>}
          <div className="flex items-center gap-2 mt-2">
            {book.genre && (
              <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {book.genre.replace(/_/g, ' ')}
              </span>
            )}
            {onStatusChange ? (
              <StatusDropdown book={book} onStatusChange={onStatusChange} onOpenChange={setDropdownOpen} />
            ) : (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[book.status]}`}>
                {STATUS_LABELS[book.status]}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={`w-[180px] shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-gray-300 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col relative ${dropdownOpen ? 'z-50' : 'z-0'}`}
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
          <Star size={14} className="absolute top-2 right-2 text-[#D4AF37] fill-[#D4AF37] pointer-events-none" />
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

      {/* Status + delete — bottom of card */}
      <div className="mt-auto flex items-center justify-between gap-2 shrink-0 min-h-[28px]">
        <div className="min-w-0 flex-1 flex items-center">
          {onStatusChange ? (
            <StatusDropdown book={book} onStatusChange={onStatusChange} onOpenChange={setDropdownOpen} />
          ) : (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[book.status]}`}>
              {STATUS_LABELS[book.status]}
            </span>
          )}
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Delete book"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  )
}
