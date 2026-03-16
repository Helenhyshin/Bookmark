'use client'

import { Star } from 'lucide-react'
import type { Book } from '@/lib/types'

interface AuthorPanelProps {
  books: Book[]
}

export default function AuthorPanel({ books }: AuthorPanelProps) {
  const favoriteAuthors = Array.from(
    new Set(books.filter((b) => b.is_favorite && b.author).map((b) => b.author!))
  )

  if (favoriteAuthors.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <Star size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">Star a book to start tracking your favourite authors.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {favoriteAuthors.map((author) => {
        const authorBooks = books.filter((b) => b.author === author)
        const unread = authorBooks.filter((b) => b.status === 'want_to_read')
        const read = authorBooks.filter((b) => b.status === 'completed')

        return (
          <div key={author} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <Star size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
              </div>
              <h3 className="font-serif font-semibold text-sm leading-tight">{author}</h3>
            </div>

            <div className="flex gap-3 text-xs text-gray-500">
              <span><strong className="text-black">{read.length}</strong> read</span>
              <span><strong className="text-black">{unread.length}</strong> to read</span>
            </div>

            {unread.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">On your list</p>
                {unread.slice(0, 2).map((b) => (
                  <div key={b.id} className="flex items-center gap-2">
                    <div
                      className="w-5 h-7 rounded shrink-0"
                      style={{ backgroundColor: b.cover_color ?? '#8B7355' }}
                    />
                    <span className="text-xs text-gray-700 truncate">{b.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
