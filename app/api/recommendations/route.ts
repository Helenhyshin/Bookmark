import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getRecommendations } from '@/lib/ai-helpers'
import type { Book, Recommendation } from '@/lib/types'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id)

  const books = (data as Book[]) ?? []

  // Fallback if no books
  if (books.length === 0) {
    return NextResponse.json(getRecommendations(books))
  }

  const bookList = books
    .map((b) => `- "${b.title}" by ${b.author ?? 'Unknown'} (${b.genre ?? 'Unknown genre'})`)
    .join('\n')

  const prompt = `Based on this user's reading library:\n${bookList}\n\nRecommend exactly 4 books they haven't read yet. Return ONLY a raw JSON array (no markdown, no explanation) with this exact schema:\n[{"title":"...","author":"...","genre":"...","coverColor":"...","reasoning":"..."}]\n\ncoverColor must be a hex color that fits the book's mood. reasoning should be 1-2 sentences explaining why this book suits their taste.`

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: 'You are a literary recommendation engine. Return only raw JSON arrays, never markdown code blocks or explanation text.',
        messages: [{ role: 'user', content: prompt }],
      },
      { signal: AbortSignal.timeout(15000) }
    )

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const recs: Recommendation[] = JSON.parse(text)
    return NextResponse.json(recs)
  } catch {
    // Fall back to static recommendations
    return NextResponse.json(getRecommendations(books))
  }
}
