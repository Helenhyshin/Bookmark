import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')

  if (!query || query.trim().length < 2) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    const res = await fetch(
      `https://api.datamuse.com/sug?s=${encodeURIComponent(query.trim())}&max=8`,
      { next: { revalidate: 60 } }
    )

    if (!res.ok) return NextResponse.json([])

    const data: Array<{ word: string; score: number }> = await res.json()
    return NextResponse.json(data.map((d) => d.word))
  } catch {
    return NextResponse.json([])
  }
}
