import { NextRequest, NextResponse } from 'next/server'

const NYT_LIST_MAP = {
  'hardcover-fiction': 'hardcover-fiction',
  'hardcover-nonfiction': 'hardcover-nonfiction',
  'paperback-fiction': 'trade-fiction-paperback',
  'paperback-nonfiction': 'paperback-nonfiction',
} as const

export type NYTListKey = keyof typeof NYT_LIST_MAP

export interface NYTBook {
  rank: number
  title: string
  author: string
  description: string
  coverUrl: string | null
  weeksOnList: number
}

export async function GET(req: NextRequest) {
  const list = req.nextUrl.searchParams.get('list') as NYTListKey
  if (!list || !NYT_LIST_MAP[list]) {
    return NextResponse.json({ error: 'Invalid list' }, { status: 400 })
  }

  const apiKey = process.env.NYT_BOOKS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'NYT_BOOKS_API_KEY not set' }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://api.nytimes.com/svc/books/v3/lists/current/${NYT_LIST_MAP[list]}.json?api-key=${apiKey}`,
      { next: { revalidate: 3600 } } // cache 1 hour
    )
    if (!res.ok) throw new Error(`NYT API responded ${res.status}`)

    const data = await res.json()
    const books: NYTBook[] = (data.results?.books ?? []).slice(0, 15).map((b: Record<string, unknown>) => ({
      rank: b.rank as number,
      title: b.title as string,
      author: b.author as string,
      description: b.description as string,
      coverUrl: (b.book_image as string) || null,
      weeksOnList: b.weeks_on_list as number,
    }))

    return NextResponse.json(books)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bestsellers' }, { status: 502 })
  }
}
