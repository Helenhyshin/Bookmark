import { NextRequest, NextResponse } from 'next/server'

export interface BookSuggestion {
  title: string
  author: string
  coverUrl: string | null
  genre: string | null
  isbn: string | null
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query || query.trim().length < 2) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(query.trim())}&limit=8&fields=title,author_name,cover_i,isbn,subject`,
      { next: { revalidate: 30 } }
    )

    if (!res.ok) return NextResponse.json([])

    const data = await res.json()
    const docs = data.docs ?? []

    const suggestions: BookSuggestion[] = docs.map((doc: {
      title?: string
      author_name?: string[]
      cover_i?: number
      isbn?: string[]
      subject?: string[]
    }) => ({
      title: doc.title ?? '',
      author: doc.author_name?.[0] ?? '',
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      genre: doc.subject?.[0] ?? null,
      isbn: doc.isbn?.[0] ?? null,
    }))

    return NextResponse.json(suggestions)
  } catch {
    return NextResponse.json([])
  }
}
