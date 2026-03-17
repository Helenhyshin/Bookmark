import type { Book, Recommendation } from './types'

const GENRE_RECOMMENDATIONS: Record<string, Recommendation[]> = {
  'Literary Fiction': [
    {
      title: 'Normal People',
      author: 'Sally Rooney',
      genre: 'Literary Fiction',
      coverColor: '#8B7355',
      reasoning: 'Matches your love of character-driven, emotionally layered literary fiction.',
    },
    {
      title: 'A Little Life',
      author: 'Hanya Yanagihara',
      genre: 'Literary Fiction',
      coverColor: '#6B4226',
      reasoning: 'Profound and devastating — aligned with the literary depth you favour.',
    },
  ],
  'Dark Themes': [
    {
      title: 'We Need to Talk About Kevin',
      author: 'Lionel Shriver',
      genre: 'Psychological',
      coverColor: '#2C3E50',
      reasoning: 'Your dark theme reads suggest you appreciate unflinching psychological tension.',
    },
  ],
  Fantasy: [
    {
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      genre: 'Fantasy',
      coverColor: '#1A472A',
      reasoning: 'Rich world-building and prose style match your fantasy tastes.',
    },
    {
      title: 'Jonathan Strange & Mr Norrell',
      author: 'Susanna Clarke',
      genre: 'Historical Fantasy',
      coverColor: '#3D2B1F',
      reasoning: 'Slow-burn magic and meticulous world-building you will love.',
    },
  ],
  'Science Fiction': [
    {
      title: 'Exhalation',
      author: 'Ted Chiang',
      genre: 'Science Fiction',
      coverColor: '#1B3A4B',
      reasoning: 'Short-form sci-fi that explores ideas with the depth your reading history shows.',
    },
  ],
  Mystery: [
    {
      title: 'The Thursday Murder Club',
      author: 'Richard Osman',
      genre: 'Cosy Mystery',
      coverColor: '#8E4B2E',
      reasoning: 'Witty, character-rich mystery that fits your reading pattern.',
    },
  ],
  Default: [
    { title: 'The Midnight Library', author: 'Matt Haig', genre: 'Contemporary Fiction', coverColor: '#2E4057', reasoning: '' },
    { title: 'Educated', author: 'Tara Westover', genre: 'Memoir', coverColor: '#5C4033', reasoning: '' },
    { title: 'Piranesi', author: 'Susanna Clarke', genre: 'Fantasy', coverColor: '#3B3B6D', reasoning: '' },
    { title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', genre: 'Literary Fiction', coverColor: '#6D4C41', reasoning: '' },
    { title: 'Project Hail Mary', author: 'Andy Weir', genre: 'Science Fiction', coverColor: '#1B3A4B', reasoning: '' },
    { title: 'Where the Crawdads Sing', author: 'Delia Owens', genre: 'Literary Fiction', coverColor: '#4A6741', reasoning: '' },
    { title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid', genre: 'Historical Fiction', coverColor: '#8B4513', reasoning: '' },
    { title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help', coverColor: '#2C3E50', reasoning: '' },
    { title: 'Klara and the Sun', author: 'Kazuo Ishiguro', genre: 'Science Fiction', coverColor: '#D4A574', reasoning: '' },
    { title: 'The Invisible Life of Addie LaRue', author: 'V.E. Schwab', genre: 'Fantasy', coverColor: '#5C4033', reasoning: '' },
  ],
}

export function getPatternChips(books: Book[]): string[] {
  const genreCounts: Record<string, number> = {}
  books.forEach((b) => {
    if (b.genre) genreCounts[b.genre] = (genreCounts[b.genre] ?? 0) + 1
  })
  const sorted = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([g]) => g)
    .slice(0, 4)

  const hasDark = books.some(
    (b) =>
      b.synopsis?.toLowerCase().includes('dark') ||
      b.synopsis?.toLowerCase().includes('trauma') ||
      b.synopsis?.toLowerCase().includes('grief')
  )
  if (hasDark && !sorted.includes('Dark Themes')) sorted.push('Dark Themes')

  return sorted.length > 0 ? sorted : ['Literary Fiction', 'Contemporary', 'Non-fiction']
}

export function getRecommendations(books: Book[]): Recommendation[] {
  const chips = getPatternChips(books)
  const seen = new Set<string>()
  const results: Recommendation[] = []

  for (const chip of chips) {
    const recs = GENRE_RECOMMENDATIONS[chip] ?? []
    for (const r of recs) {
      if (!seen.has(r.title) && results.length < 10) {
        const alreadyOwned = books.some(
          (b) => b.title.toLowerCase() === r.title.toLowerCase()
        )
        if (!alreadyOwned) {
          seen.add(r.title)
          results.push(r)
        }
      }
    }
  }

  if (results.length < 10) {
    for (const r of GENRE_RECOMMENDATIONS['Default']) {
      if (!seen.has(r.title) && results.length < 10) {
        seen.add(r.title)
        results.push(r)
      }
    }
  }

  return results
}
