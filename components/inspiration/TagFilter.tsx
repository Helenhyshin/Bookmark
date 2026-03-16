'use client'

const TAGS = ['All', 'Poetry', 'Prose', 'Philosophy', 'Personal', 'Nature', 'Images']

interface TagFilterProps {
  active: string
  onChange: (tag: string) => void
}

export default function TagFilter({ active, onChange }: TagFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => onChange(tag)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === tag
              ? 'bg-black text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-black'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
