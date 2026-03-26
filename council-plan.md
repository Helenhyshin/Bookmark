# Bookmark — Council Plan

_Generated 2026-03-25_

## Executive Summary

Bookmark is a personal reading companion app (Next.js 16 / Supabase / Tailwind v4) that combines book tracking, vocabulary building, and quote collection -- a unique product combination with no direct competitor. The codebase is functional but has critical gaps: the For You page route does not exist despite full backend and component infrastructure, API routes are publicly accessible without auth, the schema has no version-controlled migrations, and delete operations fire without awaiting responses or handling errors. The immediate path forward requires deciding whether this is a personal tool or a product (this gates security, analytics, and marketing work), then shipping the For You page, locking down security, and surfacing the book-to-word connection that is the app's core differentiator.

## Top 10 Immediate Actions

| # | Action | Owner | Priority | Effort |
|---|--------|-------|----------|--------|
| 1 | **Decide personal tool vs. product** -- gates all security, marketing, and scaling work | PM (user) | P0 | 1 hr decision |
| 2 | **Add auth checks to all API routes** -- middleware excludes `/api/` paths, meaning `/api/recommendations`, `/api/image`, `/api/dictionary` are fully public | Backend | P0 | 3-4 hrs |
| 3 | **Ship For You page** -- create `app/(app)/for-you/page.tsx`, add route to Sidebar and BottomNav; components and API already exist | Frontend | P0 | 2-3 hrs |
| 4 | **Fix handleDelete in words/page.tsx** -- currently fire-and-forget with no `await`, no error handling, no rollback on failure | Frontend | P0 | 30 min |
| 5 | **Replace `confirm()` dialogs** in book delete flows with inline confirmation or modal | Frontend + UI/UX | P0 | 3-4 hrs |
| 6 | **Add Wordnik API key to .env** -- slot already exists in `.env.example`, word-of-day endpoint already built | PM | P0 | 15 min |
| 7 | **Audit and verify RLS policies** in Supabase dashboard -- cannot verify from code, single most important security unknown | Backend | P0 | 2-3 hrs |
| 8 | **Add rate limit + timeout to recommendations route** -- currently does unbounded `Promise.all` over 10+ HTTP calls with no timeout, plus force-refresh has no cooldown | Backend | P1 | 1 day |
| 9 | **Surface book-to-word connection in UI** -- `word_bank.book_source_id` FK exists but is invisible; this is the core differentiator | UI/UX + Frontend | P1 | 1-2 days |
| 10 | **Resolve brand identity** -- app shows "Folio" on login, "Bookmark" elsewhere | PM + Marketing | P1 | 2 hrs |

## 30-Day Sprint Plan

### Week 1: Ship & Secure
- Create `/for-you` route, wire into Sidebar and BottomNav navigation
- Add auth middleware or per-route auth checks to all API endpoints
- Fix `handleDelete` to await the Supabase call and handle errors with rollback
- Replace both `confirm()` calls with a reusable confirmation modal component
- Add Wordnik API key; verify rate limits on free tier
- Audit RLS policies in Supabase dashboard; document findings

### Week 2: Core UX
- Surface book-source on word cards (show which book a word came from)
- Add word-count-per-book display on BookDetail
- Fix `CurrentlyReading` component `.single()` crash on zero books
- Improve mobile touch targets on status badges (minimum 44px)
- Add ARIA labels to sidebar icons

### Week 3: Stability
- Add rate limiting to image proxy (size cap + request throttle)
- Add cooldown to AI recommendation refresh (prevent cost runaway)
- Add timeout to recommendations cover-fetch phase
- Fix dark mode: migrate from `!important` overrides to CSS custom properties
- Fix masonry skeleton collapse on narrow viewports

### Week 4: Foundation
- Generate initial migration files from current Supabase schema; commit to repo
- Update `CLAUDE.md` to document `ai_recommendations` table
- Instrument 3-5 core user flows with basic analytics (page views, feature usage)
- Set up basic error monitoring (Sentry or equivalent)

## 60-Day Milestones

- **All API routes authenticated** -- zero public endpoints (verified by automated test)
- **RLS policies documented** and version-controlled alongside migrations
- **Book-to-word connection visible** throughout the app (word cards, book detail, dashboard)
- **For You page live** with real Anthropic integration replacing mock AI (or clear "beta" labeling if mocks remain)
- **Analytics running** with baseline data on feature adoption (books added, words saved, quotes created, For You engagement)
- **Dark mode fully functional** via CSS custom properties, no `!important` hacks
- **Progress tracking UX improved** -- quick-update from dashboard without navigating to book detail
- **Data export endpoint** built (JSON download of user's books, words, quotes)

## 90-Day Vision

Bookmark is a deployed, stable reading companion used by its creator (and optionally early testers) with confidence. The app reliably tracks books, builds vocabulary with dictionary integration and book provenance, collects quotes/passages, and surfaces AI-powered recommendations. Security is verified (RLS + API auth), the schema is version-controlled, and basic observability exists. If the product path is chosen: a landing page exists, social auth is available, shareable reading stats or word collections enable organic growth, and the app is positioned for a Product Hunt launch targeting the intersection of readers and vocabulary builders. The brand name is resolved and consistent. The "reading identity system" -- where books, words, and quotes form a connected graph of a person's reading life -- is the visible, defensible differentiator.

## Critical Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| 1 | **Public API routes exploited** -- all `/api/*` paths bypass auth middleware | High | Critical | Add per-route auth checks this week; update middleware matcher |
| 2 | **RLS policies missing or misconfigured** -- if absent, any authenticated user can read/write all data | Medium | Critical | Audit in Supabase dashboard immediately; add RLS integration tests |
| 3 | **Supabase free tier pauses after 7 days inactivity** -- data appears lost to users | High (if personal tool) | High | Set up keepalive cron job; upgrade to Pro if product path chosen |
| 4 | **Unbounded AI costs** -- force-refresh on recommendations has no rate limit | Medium | Medium | Add per-user cooldown (1 refresh/hour); add monthly cost cap alert |
| 5 | **Mock AI shipped as real** -- For You uses hardcoded genre logic; users will perceive it as fake | High (once shipped) | Medium | Either integrate real Anthropic API or clearly label as "based on your genres" |

## Success Metrics

| KPI | Target (90 days) |
|-----|------------------|
| All API routes require authentication | 100% coverage |
| RLS policies documented and tested | All tables covered |
| For You page shipped and accessible from nav | Live |
| Book-to-word connection visible in UI | Words show source book; books show word count |
| Delete operations use proper confirmation + error handling | Zero `confirm()` calls, zero fire-and-forget deletes |
| Core flows instrumented with analytics | 5+ events tracked |
| Error monitoring active | Zero silent failures in API routes |
| Migration files in version control | Schema fully captured |

## Open Questions

1. **Personal tool or product?** This is the blocking decision. Security hardening matters either way, but analytics depth, landing page, social auth, shareable outputs, and Supabase tier all depend on this answer.

2. **Real AI or mock AI for For You?** Should the recommendations page use actual Anthropic API calls, or is the current genre-based mock logic acceptable?

3. **Which brand name?** "Folio" (currently on login) or "Bookmark" (everywhere else, repo name, docs)? Pick one and kill the other.

4. **Deployment status?** Is the app deployed anywhere (Vercel, etc.)? If not, when should it be?

5. **Target users for first external feedback?** If going the product route, who are the first 5-10 testers?
