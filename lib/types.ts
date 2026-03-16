export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  daily_goal: number
}

export interface Book {
  id: string
  user_id: string
  title: string
  author: string | null
  genre: string | null
  synopsis: string | null
  status: 'reading' | 'want_to_read' | 'completed'
  cover_color: string | null
  is_favorite: boolean
  progress: number
  created_at: string
}

export interface WordEntry {
  id: string
  user_id: string
  word: string
  definition: string | null
  part_of_speech: string | null
  etymology: string | null
  book_source_id: string | null
  created_at: string
}

export interface Inspiration {
  id: string
  user_id: string
  type: 'quote' | 'passage' | 'image'
  content: string | null
  source: string | null
  tags: string[] | null
  image_url: string | null
  color_border: 'gold' | 'purple' | null
  created_at: string
}

export interface Recommendation {
  title: string
  author: string
  genre: string
  coverColor: string
  reasoning: string
}
