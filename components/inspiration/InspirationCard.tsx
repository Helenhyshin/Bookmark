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
      className="masonry-item w-[240px] min-h-[200px] shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 group flex flex-col"
      style={{ borderLeftColor: borderColor, borderLeftWidth: 4 }}
    >
      <div className="flex items-start justify-between gap-2 shrink-0">
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
          className="w-full max-h-40 rounded-lg mt-3 object-cover shrink-0"
        />
      )}

      {/* Text content - scrollable when long */}
      {item.content && (
        <div className="flex-1 min-h-0 overflow-y-auto mt-2">
          <p className={`leading-relaxed text-gray-800 pr-1 ${
            item.type === 'quote' ? 'text-sm italic font-serif' : 'text-sm'
          }`}>
            {item.type === 'quote' && <span className="text-[#D4AF37] font-bold mr-1">&ldquo;</span>}
            {item.content}
            {item.type === 'quote' && <span className="text-[#D4AF37] font-bold ml-1">&rdquo;</span>}
          </p>
        </div>
      )}

      {item.source && (
        <p className="mt-2 text-xs text-gray-400 shrink-0">— {item.source}</p>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 shrink-0">
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
