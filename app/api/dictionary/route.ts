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

    const meanings = entry?.meanings ?? []
    const firstMeaning = meanings[0]
    const firstDefinition = firstMeaning?.definitions?.[0]

    const definition = firstDefinition?.definition ?? null
    const partOfSpeech = firstMeaning?.partOfSpeech ?? null
    const etymology = entry?.origin ?? null

    return NextResponse.json({ definition, partOfSpeech, etymology, word: entry?.word ?? word })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch definition' }, { status: 500 })
  }
}
