'use client'

import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Recommendation } from '@/lib/types'

interface RecommendationCardProps {
  rec: Recommendation
  onAdded?: () => void
}

const CARD_WIDTH = 180
const CARD_HEIGHT = 280

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
      cover_image_url: rec.coverImageUrl ?? null,
      status: 'want_to_read',
    })
    onAdded?.()
  }

  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col shrink-0"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      {/* Fixed cover */}
      <div
        className="w-full rounded-lg mb-2 shadow-sm overflow-hidden shrink-0 relative"
        style={{ backgroundColor: rec.coverColor, aspectRatio: '2/3' }}
      >
        {rec.coverImageUrl && (
          <img
            src={`/api/image?url=${encodeURIComponent(rec.coverImageUrl)}`}
            alt={rec.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        )}
      </div>

      <div className="h-5 flex items-center shrink-0 mb-1">
        <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
          {rec.genre}
        </span>
      </div>
      <div className="h-9 flex items-start shrink-0 overflow-hidden">
        <h3 className="font-serif font-semibold text-xs leading-tight line-clamp-3">{rec.title}</h3>
      </div>
      <div className="h-5 flex items-center shrink-0 overflow-hidden">
        <p className="text-[11px] text-gray-500 line-clamp-1 truncate">{rec.author}</p>
      </div>

      <div className="flex-1 min-h-0" />

      <button
        onClick={handleAdd}
        className="h-8 flex items-center justify-center gap-1 bg-black text-white text-[11px] font-medium rounded-lg hover:bg-gray-900 transition-colors shrink-0"
      >
        <Plus size={13} /> Add to library
      </button>
    </div>
  )
}
