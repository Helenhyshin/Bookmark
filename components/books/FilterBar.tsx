'use client'

import { ChevronDown } from 'lucide-react'

type Status = 'all' | 'reading' | 'want_to_read' | 'completed'

const filters: { value: Status; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'reading', label: 'Reading' },
  { value: 'want_to_read', label: 'Want to Read' },
  { value: 'completed', label: 'Completed' },
]

interface FilterBarProps {
  active: Status
  onChange: (s: Status) => void
  counts: Record<Status, number>
  genres: string[]
  activeGenre: string
  onGenreChange: (genre: string) => void
}

export default function FilterBar({ active, onChange, counts, genres, activeGenre, onGenreChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
      <div className="flex gap-2 shrink-0">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active === value
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-black'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs ${active === value ? 'text-gray-300' : 'text-gray-400'}`}>
              {counts[value]}
            </span>
          </button>
        ))}
      </div>

      {genres.length > 0 && (
        <div className="relative shrink-0">
          <select
            value={activeGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            className={`appearance-none pl-4 pr-8 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              activeGenre
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-black'
            }`}
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${activeGenre ? 'text-gray-300' : 'text-gray-400'}`} />
        </div>
      )}
    </div>
  )
}
