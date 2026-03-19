# Bookmark — Project Overview

A personal reading companion app for tracking books, saving vocabulary, and collecting inspirational quotes/passages.

## Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend/Auth**: Supabase (PostgreSQL, Auth, Storage)
- **PWA**: `@ducanh2912/next-pwa`
- **Icons**: `lucide-react`
- **External API**: Free Dictionary API (word auto-definition + suggestions)

## App Structure

```
app/
  (app)/          # Authenticated app shell
    page.tsx        → Dashboard
    books/          → Library
    words/          → Word Bank
    inspiration/    → Inspiration Board
    for-you/        → AI Recommendations
    layout.tsx      → Sidebar + BottomNav wrapper
  (auth)/
    login/
    signup/
  api/
    dictionary/     → Proxy to Free Dictionary API
    dictionary/suggest/ → Word suggestions endpoint
```

## Design System

- **Body bg**: Warm Beige (`#F5F5F0` / `bg-stone-100`)
- **Sidebar/TopBar**: Black (`#000000`)
- **Accents**: Gold (`#D4AF37`) for quotes/favorites, Purple (`#800080`) for passages
- **Layout (desktop)**: 60px fixed black sidebar (left) + persistent black top bar
- **Layout (mobile)**: Bottom tab bar with 5 icons (Home, Books, Words, Inspire, For You)
- **Cards**: Masonry grid for Inspiration, 4-column grid for Books

## Database Schema (Supabase)

| Table | Key Columns |
|-------|-------------|
| `profiles` | `id` (uuid), `username`, `avatar_url`, `daily_goal` (int) |
| `books` | `id`, `user_id`, `title`, `author`, `genre`, `synopsis`, `status` (reading/want_to_read/completed), `cover_color`, `is_favorite`, `progress` |
| `word_bank` | `id`, `user_id`, `word`, `definition`, `part_of_speech`, `etymology`, `book_source_id` (fk books) |
| `inspirations` | `id`, `user_id`, `type` (quote/passage/image), `content`, `source`, `tags` (text[]), `image_url`, `color_border` (gold/purple) |

## Key Files

- `lib/types.ts` — shared TypeScript interfaces (Book, WordEntry, Inspiration, Recommendation, Profile)
- `lib/supabase/client.ts` — browser Supabase client
- `lib/supabase/server.ts` — server Supabase client
- `lib/ai-helpers.ts` — mock AI logic for "For You" recommendations based on genres
- `proxy.ts` — middleware proxy export

## Components

- `components/layout/` — Sidebar, TopBar, BottomNav
- `components/books/` — BookCard, BookDetail, FilterBar
- `components/words/` — WordCard, AddWordForm, AlphaNav (alphabetical jump nav)
- `components/inspiration/` — InspirationCard, TagFilter
- `components/for-you/` — RecommendationCard, AuthorPanel, PatternChips
- `components/dashboard/` — StatCards, CurrentlyReading, AIPicks
- `components/ui/` — FloatingAddButton, QuickAddBar

## Features

1. **Dashboard** — Stat cards + currently reading progress tracker + AI picks
2. **Library** — Book grid with filter bar (All / Reading / Want to Read / Completed)
3. **Word Bank** — Alphabetical nav, Free Dictionary API auto-define, live suggestions
4. **Inspiration Board** — Masonry layout, tag filtering, gold/purple border accents
5. **For You** — AI recommendation UI with genre-based reasoning

## Dev Commands

```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run lint    # ESLint
```
