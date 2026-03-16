'use client'

import { Trash2, Quote, AlignLeft, Image } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Inspiration } from '@/lib/types'

interface InspirationCardProps {
  item: Inspiration
  onDeleted: () => void
}

const TYPE_ICONS = {
  quote: Quote,
  passage: AlignLeft,
  image: Image,
}

export default function InspirationCard({ item, onDeleted }: InspirationCardProps) {
  const borderColor = item.color_border === 'gold' ? '#D4AF37' : item.color_border === 'purple' ? '#800080' : 'transparent'
  const Icon = TYPE_ICONS[item.type] ?? AlignLeft

  const handleDelete = async () => {
    const supabase = createClient()
    await supabase.from('inspirations').delete().eq('id', item.id)
    onDeleted()
  }

  return (
    <div
      className="masonry-item bg-white rounded-2xl p-4 shadow-sm border border-gray-100 group"
      style={{ borderLeftColor: borderColor, borderLeftWidth: 4 }}
    >
      <div className="flex items-start justify-between gap-2">
        <Icon size={14} className="text-gray-300 shrink-0 mt-0.5" />
        <button
          onClick={handleDelete}
          className="text-gray-200 group-hover:text-red-400 transition-colors shrink-0"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Image type */}
      {item.type === 'image' && item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.source ?? 'Inspiration'}
          className="w-full rounded-lg mt-3 object-cover"
        />
      )}

      {/* Text content */}
      {item.content && (
        <p className={`mt-2 leading-relaxed text-gray-800 ${
          item.type === 'quote' ? 'text-sm italic font-serif' : 'text-sm'
        }`}>
          {item.type === 'quote' && <span className="text-[#D4AF37] font-bold mr-1">&ldquo;</span>}
          {item.content}
          {item.type === 'quote' && <span className="text-[#D4AF37] font-bold ml-1">&rdquo;</span>}
        </p>
      )}

      {item.source && (
        <p className="mt-2 text-xs text-gray-400">— {item.source}</p>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {item.tags.map((tag) => (
            <span key={tag} className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
