'use client'

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
}

export default function FilterBar({ active, onChange, counts }: FilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
  )
}
