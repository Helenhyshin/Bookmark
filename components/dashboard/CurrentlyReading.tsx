'use client'

import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Book } from '@/lib/types'

export default function CurrentlyReading() {
  const [book, setBook] = useState<Book | null>(null)

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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start gap-4">
        {/* Cover */}
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-14 h-20 rounded-lg shrink-0 shadow object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div
            className="w-14 h-20 rounded-lg shrink-0 shadow"
            style={{ backgroundColor: book.cover_color ?? '#8B7355' }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Currently Reading</p>
          <h3 className="font-serif font-semibold text-lg leading-tight truncate">{book.title}</h3>
          {book.author && <p className="text-sm text-gray-500">{book.author}</p>}
        </div>
      </div>

    </div>
  )
}
