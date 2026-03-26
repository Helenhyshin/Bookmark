'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FilterBar from '@/components/books/FilterBar'
import BookCard from '@/components/books/BookCard'
import BookDetail from '@/components/books/BookDetail'
import AddBookForm from '@/components/books/AddBookForm'
import type { Book } from '@/lib/types'

type Status = 'all' | 'reading' | 'want_to_read' | 'completed'

export default function BooksPage() {
  return (
    <Suspense>
      <BooksPageInner />
    </Suspense>
  )
}

function BooksPageInner() {
  const searchParams = useSearchParams()
  const initialFilter = (searchParams.get('filter') as Status | null) ?? 'all'

  const [books, setBooks] = useState<Book[]>([])
  const [filter, setFilter] = useState<Status>(initialFilter)
  const [genreFilter, setGenreFilter] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleStatusChange = useCallback(async (book: Book, status: Book['status']) => {
    const supabase = createClient()
    await supabase.from('books').update({ status }).eq('id', book.id)
    setBooks((prev) => prev.map((b) => b.id === book.id ? { ...b, status } : b))
    if (selectedBook?.id === book.id) {
      setSelectedBook((prev) => prev ? { ...prev, status } : prev)
    }
  }, [selectedBook])

  const handleDelete = useCallback(async (book: Book) => {
    if (!confirm(`Remove “${book.title}” from your library?`)) return
    const supabase = createClient()
    const { error } = await supabase.from('books').delete().eq('id', book.id)
    if (error) return
    setBooks((prev) => prev.filter((b) => b.id !== book.id))
    setSelectedBook((prev) => (prev?.id === book.id ? null : prev))
  }, [])

  const genres = Array.from(
    new Set(books.map((b) => b.genre).filter((g): g is string => !!g))
  ).sort()

  const filtered = books.filter((b) => {
    if (filter !== 'all' && b.status !== filter) return false
    if (genreFilter && b.genre !== genreFilter) return false
    return true
  })

  const counts: Record<Status, number> = {
    all: books.length,
    reading: books.filter((b) => b.status === 'reading').length,
    want_to_read: books.filter((b) => b.status === 'want_to_read').length,
    completed: books.filter((b) => b.status === 'completed').length,
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Always-visible add form */}
      <AddBookForm onAdded={fetchBooks} />

      {/* Filter bar */}
      <div className="mb-4">
        <FilterBar active={filter} onChange={setFilter} counts={counts} genres={genres} activeGenre={genreFilter} onGenreChange={setGenreFilter} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-[180px] h-[366px] shrink-0 bg-white rounded-2xl p-4 animate-pulse border border-gray-100" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">No books yet</p>
          <p className="text-sm">Search for a book above to add it to your library.</p>
        </div>
      )}

      {/* Grid (desktop) */}
      {!loading && filtered.length > 0 && (
        <div className="hidden md:grid md:grid-cols-[repeat(auto-fill,180px)] md:gap-4">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              view="grid"
              onClick={() => setSelectedBook(selectedBook?.id === book.id ? null : book)}
              onStatusChange={(status) => handleStatusChange(book, status)}
              onDelete={() => handleDelete(book)}
            />
          ))}
        </div>
      )}

      {/* Desktop detail panel */}
      {!loading && selectedBook && (
        <div className="hidden md:block mt-4">
          <BookDetail
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onUpdated={fetchBooks}
          />
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
              onStatusChange={(status) => handleStatusChange(book, status)}
              onDelete={() => handleDelete(book)}
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
