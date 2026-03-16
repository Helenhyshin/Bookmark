interface PatternChipsProps {
  chips: string[]
}

export default function PatternChips({ chips }: PatternChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider self-center mr-1">
        Your patterns:
      </span>
      {chips.map((chip) => (
        <span
          key={chip}
          className="px-3 py-1 bg-black text-white text-xs font-medium rounded-full"
        >
          {chip}
        </span>
      ))}
    </div>
  )
}
