# Bookmark Project Rules & Technical Specification

## Design System (Visual Wireframes Ref)
- **Palette**: Body: Warm Beige (use `#F5F5F0` or `bg-stone-100`); Navigation: Black (`#000000`); Accents: Gold (`#D4AF37`) for quotes/favorites, Purple (`#800080`) for passages.
- **Layout (Web)**: 60px fixed Black Sidebar (left), persistent Black Top Bar.
- **Layout (Mobile)**: Bottom Tab Bar with 5 icons (Home, Books, Words, Inspire, For You).
- **Components**: 
  - Cards: Use a masonry grid for Inspiration, 4-column grid for My Books.
  - Typography: Clean serif for book titles, sans-serif for UI labels.

## Database Schema (Supabase)
- **profiles**: id (uuid), username, avatar_url, daily_goal (int).
- **books**: id, user_id, title, author, genre, synopsis, status (reading, want_to_read, completed), cover_color, is_favorite (bool).
- **word_bank**: id, user_id, word, definition, part_of_speech, etymology, book_source_id (fk books.id).
- **inspirations**: id, user_id, type (quote, passage, image), content, source, tags (text[]), image_url, color_border (gold/purple).

## Technical Requirements
- **Framework**: Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **Backend/Auth**: Supabase (Auth, PostgreSQL, Storage).
- **External APIs**: Integrate Free Dictionary API for the Word Bank "Auto-define" feature.
- **AI Logic**: Mock or implement a helper for "AI Picks" and "Reasoning" based on book genres in the database.

## Implementation Flow
1. **Auth & Layout**: Global Sidebar/Bottom Tab bar with responsive toggles.
2. **Dashboard**: Stat cards + "Currently Reading" progress tracker.
3. **Library**: Grid view with filter bar (All/Reading/Want/Done).
4. **Word Bank**: Alphabetical jump-nav + API auto-population.
5. **Inspiration Board**: Masonry layout with tag filtering.
6. **For You**: AI recommendation UI logic.