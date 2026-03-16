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

          {/* Word + POS */}
          <div className="flex items-baseline gap-2 mb-2 flex-wrap">
            <h3 className="font-serif font-bold text-base">{word.word}</h3>
            {word.part_of_speech && (
              <span className="text-[10px] font-semibold text-[#800080] bg-[#800080]/10 px-2 py-0.5 rounded-full capitalize">
                {word.part_of_speech}
              </span>
            )}
          </div>

          {/* Definition */}
          {word.definition ? (
            <p className="text-sm text-gray-700 leading-relaxed">{word.definition}</p>
          ) : (
            <p className="text-sm text-gray-300 italic">No definition saved.</p>
          )}

          {/* Etymology */}
          {word.etymology && (
            <p className="text-xs text-gray-400 italic mt-2 leading-relaxed border-t border-gray-100 pt-2">
              <span className="font-semibold not-italic text-gray-500">Origin: </span>
              {word.etymology}
            </p>
          )}

          {/* Book source */}
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
