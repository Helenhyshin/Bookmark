# Bookmark — Improvement Roadmap

Generated during app review on 2026-03-19.

---

## High Impact

- [ ] **Reading progress bar** — `books.progress` column exists but CurrentlyReading only shows it as text. Add a visual progress bar + quick-update button so users can bump progress without opening the full book detail.

- [ ] **Stats over time / streak tracker** — Stat cards are snapshots. A weekly/monthly "books completed" view or GitHub-calendar-style streak grid would turn Bookmark from a tracker into a motivator.

- [x] **Word Bank daily review (flashcards)** — Vocabulary is collected but never actively used. A `/words/review` route with simple flashcard cycling (word → reveal definition) would make the Word Bank worth building.

- [ ] **Inspiration share / export** — Add a "Copy to clipboard" button (or "Share as image") on InspirationCards so users can actually use the content they save.

---

## Medium Impact

- [ ] **Book notes field** — Add a `notes` text column to the `books` table and expose it in BookDetail. Users currently have no way to record thoughts about a book.

- [x] **Empty / onboarding state for new users** — Dashboard shows blank stat cards and empty carousels for new accounts. Add a prompt like "Add your first book to get started" to reduce confusion.

- [ ] **Move `RecommendationCard` out of `components/for-you/`** — The For You page was removed but `RecommendationCard.tsx` is still in that folder (used by `AIPicks.tsx`). Move it to `components/dashboard/` or `components/ui/` to clean up the dead folder.

- [x] **Duplicate detection in AI Picks** — If a recommendation is already in the user's library, show an "In your library" state instead of "Add to library" to prevent accidental duplicates.

---

## Low Impact / Polish

- [x] **Wire TopBar avatar to `profiles.avatar_url`** — Currently a static placeholder gold circle. Pull the real avatar from Supabase Storage.

- [x] **Replace mock fallback in `lib/ai-helpers.ts`** — When the Claude API fails, the app falls back to generic genre-based mock recs which could confuse users. Replace with a clear "Recommendations unavailable — try again later" empty state.

- [x] **Keyboard navigation on carousels** — Add arrow key support to the AIPicks carousel for accessibility.
