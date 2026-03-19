import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.WORDNIK_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'WORDNIK_API_KEY not set' }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=${apiKey}`,
      { next: { revalidate: 3600 } } // cache for 1 hour; Wordnik updates daily
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch word of the day' }, { status: 502 })
    }

    const data = await res.json()

    const word: string = data.word ?? ''
    const firstDef = data.definitions?.[0]
    const definition: string | null = firstDef?.text ?? null
    const partOfSpeech: string | null = firstDef?.partOfSpeech ?? null
    const note: string | null = data.note ?? null

    return NextResponse.json({ word, definition, partOfSpeech, note })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch word of the day' }, { status: 500 })
  }
}
