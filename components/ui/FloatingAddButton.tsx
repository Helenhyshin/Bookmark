'use client'

import { useState } from 'react'
import { Plus, X, BookOpen, Type } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AddBookForm from '@/components/books/AddBookForm'

export default function FloatingAddButton() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'book' | 'word' | null>(null)
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleWordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('word_bank').insert({ user_id: user.id, word: value.trim() })
    }
    setValue('')
    setMode(null)
    setOpen(false)
    setLoading(false)
  }

  const close = () => { setOpen(false); setMode(null); setValue('') }

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
            <form onSubmit={handleWordSubmit} className="space-y-3">
              <p className="text-sm font-semibold">Add a word</p>
              <input
                autoFocus
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Word…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40"
              >
                {loading ? 'Adding…' : 'Add'}
              </button>
            </form>
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
