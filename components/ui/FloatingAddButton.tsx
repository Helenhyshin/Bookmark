'use client'

import { useState, useEffect } from 'react'
import { Plus, X, BookOpen, Type } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AddBookForm from '@/components/books/AddBookForm'
import AddWordForm from '@/components/words/AddWordForm'
import type { Book } from '@/lib/types'

export default function FloatingAddButton() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'book' | 'word' | null>(null)
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    if (mode === 'word') {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from('books').select('id, title').eq('user_id', user.id).then(({ data }) => {
            if (data) setBooks(data as Book[])
          })
        }
      })
    }
  }, [mode])

  const close = () => { setOpen(false); setMode(null) }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={close} />
      )}

      {/* Modal sheet */}
      {open && (
        <div className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl z-50 p-5 md:hidden max-h-[70vh] overflow-y-auto">
          {!mode ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">What are you adding?</p>
              <button
                onClick={() => setMode('book')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-black transition-colors"
              >
                <BookOpen size={18} /> <span className="text-sm font-medium">A book</span>
              </button>
              <button
                onClick={() => setMode('word')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-black transition-colors"
              >
                <Type size={18} /> <span className="text-sm font-medium">A word</span>
              </button>
            </div>
          ) : mode === 'book' ? (
            <AddBookForm onAdded={close} />
          ) : (
            <AddWordForm onAdded={close} books={books} />
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setOpen(!open); setMode(null) }}
        className="fixed bottom-20 right-4 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center z-50 md:hidden hover:bg-gray-900 transition-all"
      >
        {open ? <X size={22} /> : <Plus size={22} />}
      </button>
    </>
  )
}
