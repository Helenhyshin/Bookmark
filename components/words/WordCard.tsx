'use client'

import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { WordEntry } from '@/lib/types'

interface WordCardProps {
  word: WordEntry
  bookTitle?: string
  onDeleted: () => void
}

export default function WordCard({ word, bookTitle, onDeleted }: WordCardProps) {
  const handleDelete = async () => {
    const supabase = createClient()
    await supabase.from('word_bank').delete().eq('id', word.id)
    onDeleted()
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-serif font-bold text-base capitalize">{word.word}</h3>
            {word.part_of_speech && (
              <span className="text-[10px] font-medium bg-[#800080]/10 text-[#800080] px-2 py-0.5 rounded-full">
                {word.part_of_speech}
              </span>
            )}
          </div>

          {word.definition && (
            <p className="text-sm text-gray-700 leading-relaxed">{word.definition}</p>
          )}

          {word.etymology && (
            <p className="text-xs text-gray-400 italic mt-1.5 leading-relaxed">{word.etymology}</p>
          )}

          {bookTitle && (
            <span className="inline-block mt-2 text-[10px] font-medium bg-[#D4AF37]/15 text-[#9B7D00] px-2 py-0.5 rounded-full">
              📖 {bookTitle}
            </span>
          )}
        </div>

        <button
          onClick={handleDelete}
          className="text-gray-200 group-hover:text-red-400 transition-colors shrink-0 mt-0.5"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
