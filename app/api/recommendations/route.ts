import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { Book, Recommendation } from '@/lib/types'

function getCoverFromDocs(docs: Array<{ cover_i?: number }>): string | null {
  for (const doc of docs) {
    const coverId = doc.cover_i
    if (coverId && coverId > 0) {
      return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    }
  }
  return null
}

async function fetchCoverFromGoogleBooks(title: string, author: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`intitle:${title} inauthor:${author}`)
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    const data = await res.json()
    const items = data.items ?? []
    for (const item of items) {
      const links = item.volumeInfo?.imageLinks
      const url = links?.thumbnail ?? links?.smallThumbnail ?? links?.small ?? links?.medium
      if (url) {
        return url.replace('http://', 'https://')
      }
    }
    return null
  } catch {
    return null
  }
}

async function fetchCoverUrl(title: string, author: string): Promise<string | null> {
  const titleParam = encodeURIComponent(title)
  const authorParam = encodeURIComponent(author)
  const qParam = encodeURIComponent(`${title} ${author}`)

  const openLibraryUrls = [
    `https://openlibrary.org/search.json?title=${titleParam}&author=${authorParam}&limit=5`,
    `https://openlibrary.org/search.json?q=${qParam}&limit=5`,
    `https://openlibrary.org/search.json?title=${titleParam}&limit=5`,
  ]

  for (const url of openLibraryUrls) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) continue
      const data = await res.json()
      const docs = data.docs ?? []
      const cover = getCoverFromDocs(docs)
      if (cover) return cover
    } catch {
      continue
    }
  }

  return fetchCoverFromGoogleBooks(title, author)
}

async function addCoversToRecs(recs: Recommendation[]): Promise<Recommendation[]> {
  return Promise.all(
    recs.map(async (rec) => {
      const coverImageUrl = await fetchCoverUrl(rec.title, rec.author)
      return { ...rec, coverImageUrl: coverImageUrl ?? undefined }
    })
  )
}

async function generateAndCache(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  allBooks: Book[],
  bookCount: number
): Promise<Recommendation[]> {
  const wantToRead = allBooks.filter((b) => b.status === 'want_to_read')
  const booksForPrompt = wantToRead.length > 0 ? wantToRead : allBooks

  const bookList = booksForPrompt
    .map((b) => `- "${b.title}" by ${b.author ?? 'Unknown'} (${b.genre ?? 'Unknown genre'})`)
    .join('\n')

  const seed = Math.floor(Math.random() * 1_000_000)
  const prompt = `Based on this user's To Read list:\n${bookList}\n\nRecommend exactly 10 books they haven't read yet that complement their taste. Be creative and varied — avoid the most obvious choices. Seed: ${seed}\n\nReturn ONLY a raw JSON array (no markdown, no explanation) with this exact schema:\n[{"title":"...","author":"...","genre":"...","coverColor":"...","reasoning":"..."}]\n\ncoverColor must be a hex color that fits the book's mood. reasoning should be 1-2 sentences explaining why this book suits their taste.`

  let recs: Recommendation[]

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: 'You are a literary recommendation engine. Return only raw JSON arrays, never markdown code blocks or explanation text.',
        messages: [{ role: 'user', content: prompt }],
      },
      { signal: AbortSignal.timeout(25000) }
    )
    let text = message.content[0].type === 'text' ? message.content[0].text : ''
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    recs = JSON.parse(text)
  } catch (err) {
    console.error('[recommendations] AI generation failed:', err)
    throw new Error('generation_failed')
  }

  const withCovers = await addCoversToRecs(recs)

  await supabase.from('ai_recommendations').upsert({
    user_id: userId,
    recommendations: withCovers,
    book_count: bookCount,
    books_snapshot_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  return withCovers
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const force = body?.force === true

  // Get current book count and all books in parallel
  const [{ count }, { data }] = await Promise.all([
    supabase.from('books').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('books').select('*').eq('user_id', user.id),
  ])

  const currentCount = count ?? 0
  const allBooks = (data as Book[]) ?? []

  // Check cache
  const { data: cached } = await supabase
    .from('ai_recommendations')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const libraryChanged = cached != null && cached.book_count !== currentCount

  // Serve cache if valid and not forced
  if (cached && !libraryChanged && !force) {
    return NextResponse.json({ recommendations: cached.recommendations, libraryChanged: false })
  }

  // Return stale cache immediately if library changed but user hasn't asked to refresh
  if (cached && libraryChanged && !force) {
    return NextResponse.json({ recommendations: cached.recommendations, libraryChanged: true })
  }

  // No books in library yet
  if (allBooks.length === 0) {
    return NextResponse.json({ recommendations: [], noBooks: true })
  }

  // Generate fresh recommendations (first visit or forced refresh)
  try {
    const recommendations = await generateAndCache(supabase, user.id, allBooks, currentCount)
    return NextResponse.json({ recommendations, libraryChanged: false })
  } catch {
    return NextResponse.json({ error: 'generation_failed' }, { status: 500 })
  }
}
