import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const word = request.nextUrl.searchParams.get('word')

  if (!word || word.trim().length < 2) {
    return NextResponse.json({ error: 'Word is required' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }

    const data = await res.json()
    const entry = data[0]

    const rawMeanings: Array<{ partOfSpeech: string; definitions: Array<{ definition: string }> }> =
      entry?.meanings ?? []

    // Collect up to 3 distinct meanings (one per part of speech)
    const meanings = rawMeanings.slice(0, 3).map((m) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: m.definitions.slice(0, 2).map((d) => d.definition),
    }))

    const firstMeaning = rawMeanings[0]
    const definition = firstMeaning?.definitions?.[0]?.definition ?? null
    const partOfSpeech = firstMeaning?.partOfSpeech ?? null
    const etymology = entry?.origin ?? null

    return NextResponse.json({
      word: entry?.word ?? word,
      definition,
      partOfSpeech,
      etymology,
      meanings,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch definition' }, { status: 500 })
  }
}
