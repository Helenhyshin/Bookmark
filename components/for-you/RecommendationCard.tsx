'use client'

import { Plus, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Recommendation } from '@/lib/types'

interface RecommendationCardProps {
  rec: Recommendation
  isInLibrary?: boolean
  onAdded?: () => void
  rank?: number
}

export default function RecommendationCard({ rec, isInLibrary = false, onAdded, rank }: RecommendationCardProps) {
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
    <div className="w-[180px] h-full shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-gray-300 hover:-translate-y-0.5 transition-all flex flex-col">
      {/* Cover — 2:3 aspect ratio matching BookCard */}
      <div
        className="relative w-full rounded-lg shadow mb-2 shrink-0 overflow-hidden"
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
        <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full truncate">
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

      <div className="h-7 flex items-center shrink-0">
        {isInLibrary ? (
          <div className="w-full h-7 flex items-center justify-center gap-1 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-lg">
            <Check size={11} /> In your library
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="w-full h-7 flex items-center justify-center gap-1 bg-black text-white text-[10px] font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            <Plus size={11} /> Add to library
          </button>
        )}
      </div>
    </div>
  )
}
