'use client'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

interface AlphaNavProps {
  activeLetters: Set<string>
}

export default function AlphaNav({ activeLetters }: AlphaNavProps) {
  const scrollTo = (letter: string) => {
    const el = document.getElementById(`letter-${letter}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-wrap gap-1">
      {ALPHABET.map((letter) => {
        const hasWords = activeLetters.has(letter)
        return (
          <button
            key={letter}
            onClick={() => scrollTo(letter)}
            disabled={!hasWords}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
              hasWords
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-300 cursor-default'
            }`}
          >
            {letter}
          </button>
        )
      })}
    </div>
  )
}
