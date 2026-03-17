'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import FilterBar from '@/components/books/FilterBar'
import BookCard from '@/components/books/BookCard'
import BookDetail from '@/components/books/BookDetail'
import AddBookForm from '@/components/books/AddBookForm'
import type { Book } from '@/lib/types'

type Status = 'all' | 'reading' | 'want_to_read' | 'completed'

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filter, setFilter] = useState<Status>('all')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  const fetchBooks = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setBooks((data as Book[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchBooks() }, [fetchBooks])

  const filtered = filter === 'all' ? books : books.filter((b) => b.status === filter)

  const counts: Record<Status, number> = {
    all: books.length,
    reading: books.filter((b) => b.status === 'reading').length,
    want_to_read: books.filter((b) => b.status === 'want_to_read').length,
    completed: books.filter((b) => b.status === 'completed').length,
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <FilterBar active={filter} onChange={setFilter} counts={counts} />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="shrink-0 flex items-center gap-1.5 bg-black text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-900 transition-colors ml-3"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Add book form */}
      {showAddForm && (
        <AddBookForm onAdded={() => { setShowAddForm(false); fetchBooks() }} />
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-[180px] h-[280px] shrink-0 bg-white rounded-2xl p-4 animate-pulse border border-gray-100" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">No books yet</p>
          <p className="text-sm">Click &ldquo;Add&rdquo; to add your first book.</p>
        </div>
      )}

      {/* Grid (web) / List (mobile) */}
      {!loading && filtered.length > 0 && (
        <div className="hidden md:flex md:flex-wrap md:gap-4">
          {filtered.map((book) => (
            <div key={book.id}>
              <BookCard
                book={book}
                view="grid"
                onClick={() => setSelectedBook(selectedBook?.id === book.id ? null : book)}
              />
              {/* Inline detail panel for this book */}
              {selectedBook?.id === book.id && (
                <BookDetail
                  book={book}
                  onClose={() => setSelectedBook(null)}
                  onUpdated={fetchBooks}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mobile list */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col gap-3 md:hidden">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              view="list"
              onClick={() => setSelectedBook(book)}
            />
          ))}
        </div>
      )}

      {/* Mobile detail modal */}
      {selectedBook && (
        <div className="md:hidden">
          <BookDetail
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onUpdated={fetchBooks}
          />
        </div>
      )}
    </div>
  )
}
