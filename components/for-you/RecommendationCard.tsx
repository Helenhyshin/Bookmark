'use client'

import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Recommendation } from '@/lib/types'

interface RecommendationCardProps {
  rec: Recommendation
  onAdded?: () => void
}

export default function RecommendationCard({ rec, onAdded }: RecommendationCardProps) {
  const handleAdd = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('books').insert({
      user_id: user.id,
      title: rec.title,
      author: rec.author,
      genre: rec.genre,
      cover_color: rec.coverColor,
      status: 'want_to_read',
    })
    onAdded?.()
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col">
      <div className="w-full h-32 rounded-xl mb-3 shadow-sm" style={{ backgroundColor: rec.coverColor }} />
      <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full self-start mb-1.5">
        {rec.genre}
      </span>
      <h3 className="font-serif font-semibold text-sm leading-tight">{rec.title}</h3>
      <p className="text-xs text-gray-500 mt-0.5 mb-2">{rec.author}</p>
      <p className="text-xs text-gray-400 leading-relaxed flex-1 line-clamp-3">{rec.reasoning}</p>
      <button
        onClick={handleAdd}
        className="mt-3 flex items-center justify-center gap-1.5 bg-black text-white text-xs font-medium py-2 rounded-lg hover:bg-gray-900 transition-colors"
      >
        <Plus size={13} /> Add to library
      </button>
    </div>
  )
}
