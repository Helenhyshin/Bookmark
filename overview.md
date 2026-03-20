# Bookmark — How This App Is Built

This document explains how Bookmark works from the ground up — what tools we chose, why we chose them, and what each piece does. No deep technical knowledge required.

---

## The Big Picture

Bookmark is a **web app** that works like a personal reading companion. You can track books, save vocabulary words, collect quotes and passages, and get AI-powered reading recommendations.

At a high level, the app is made of three layers:

1. **The front end** — what you see and interact with in your browser
2. **The back end** — behind-the-scenes logic that handles data and talks to external services
3. **The database & storage** — where all your data lives permanently

All three layers are connected and work together every time you use the app.

---

## Where the Code Lives — GitHub

All of the code for this app is stored on **GitHub** (https://github.com). Think of GitHub as a version-controlled Google Drive for code. Every change we make to the app is saved as a "commit" — a snapshot of the code at that moment in time — and pushed to GitHub.

**Why GitHub?**
- It gives us a complete history of every change ever made, so we can always go back to a previous version if something breaks.
- It lets multiple people collaborate without overwriting each other's work.
- It connects directly to our hosting service (Vercel) so that pushing new code automatically publishes it to the live app.

---

## Where the App Is Hosted — Vercel

**Vercel** (https://vercel.com) is the service that takes our code from GitHub and makes it accessible on the internet. Every time we push code to GitHub, Vercel automatically detects the change, builds the app, and deploys it — usually within a minute or two.

**Why Vercel?**
- It is purpose-built for the framework we use (Next.js) and handles all server infrastructure for us.
- Deployments are automatic — no manual steps required to publish an update.
- It handles scaling automatically, so the app stays fast whether one person or one thousand people are using it at once.

---

## The Framework — Next.js

The app is built with **Next.js**, a popular framework built on top of React. A framework is like a pre-built set of rules and tools that gives your app structure, so you are not starting from scratch every time.

**React** is the underlying technology that powers the user interface — it lets us build the app as a collection of reusable "components" (think: a card, a button, a navigation bar) that can be snapped together like Lego pieces.

**Next.js** adds on top of React by handling:
- **Routing** — how navigating from `/books` to `/words` works
- **API routes** — small server-side functions that talk to external services securely (more on these below)
- **Performance** — smart caching and page optimization built in

**Why Next.js?**
- It is the industry standard for building modern full-stack web apps with React.
- It lets us write both the visible UI and the server logic in the same codebase, keeping things simple.
- It has first-class support on Vercel, which makes deployment seamless.

---

## The Database, Auth & Storage — Supabase

**Supabase** (https://supabase.com) is the backbone of this app. It provides three critical services in one place:

### 1. Database
Supabase gives us a **PostgreSQL** database — a powerful, structured database that stores all of the app's data. Think of it like an extremely organized spreadsheet system where each "table" holds a different type of information:

| Table | What It Stores |
|---|---|
| `profiles` | Each user's username, avatar photo URL, and daily reading goal |
| `books` | Every book a user has added — title, author, genre, reading status, progress |
| `word_bank` | Vocabulary words a user has saved, with definitions and etymologies |
| `inspirations` | Quotes, passages, and images a user has collected |
| `ai_recommendations` | Cached AI-generated book recommendations per user |

When you open the app, it reads from these tables to show you your data. When you add a book or save a word, it writes to these tables.

### 2. Authentication (Auth)
Supabase also handles **user accounts and login**. When you sign up with your email and password, Supabase securely stores your credentials and gives you a session token — a temporary key that proves who you are on every request. This is what keeps your data private and separate from other users' data.

Every piece of data in the database is tied to a specific user ID, so you only ever see your own books, words, and quotes.

### 3. File Storage
Supabase has a built-in **file storage** system (similar to Google Drive or Dropbox, but for apps). We use it to store **profile avatar images**. When you upload a photo in Settings, the image file goes directly into Supabase Storage under a folder named after your user ID. Supabase then gives us a public URL for that image, which we save in your profile so it can be displayed everywhere your avatar appears.

**Why Supabase?**
- It replaces what would otherwise require three separate services (database, auth, file storage) with one unified platform.
- It has a generous free tier, making it cost-effective for early-stage apps.
- It is built on PostgreSQL, which is one of the most reliable and well-understood databases in the world.
- It provides a real-time connection, meaning the app can update instantly when data changes without needing to refresh the page.

---

## The APIs — External Services We Connect To

An **API** (Application Programming Interface) is essentially a way for two different software systems to talk to each other. We use several external APIs to add features to the app that would be very difficult to build ourselves.

### 1. Free Dictionary API
**What it does:** When you type a word into the Word Bank and click "Look up," this API returns the definition, part of speech, etymology, and example sentence for that word.

**Where it comes from:** `https://api.dictionaryapi.dev` — a completely free, no-account-required dictionary service.

**How we use it:** Our app sends the word to this API, it responds with structured data, and we display that data pre-filled in the "Add Word" form. This saves you from having to manually type out definitions.

---

### 2. Wordnik API
**What it does:** Powers the **Word of the Day** feature on the Dashboard. Every day, Wordnik surfaces a different interesting word with its definition and part of speech.

**Where it comes from:** `https://wordnik.com` — a comprehensive English language dictionary and word reference platform.

**How we use it:** Once per hour, our app asks Wordnik for today's word. We cache (temporarily save) the result so we are not asking for the same word hundreds of times a day. The word appears in the "Word of the Day" card on your Dashboard.

---

### 3. NYT Books API (New York Times)
**What it does:** Powers the **Bestsellers** section on the Dashboard. It provides real-time bestseller lists from the New York Times — hardcover fiction, hardcover nonfiction, paperback fiction, and paperback nonfiction.

**Where it comes from:** `https://developer.nytimes.com` — the official New York Times developer platform. Requires an API key (a private password that identifies our app to their servers).

**How we use it:** We fetch the current top 15 books from whichever list you select. The data is cached for one hour so the app stays fast and we do not hit the NYT servers on every page load.

---

### 4. Open Library API
**What it does:** Two things — (a) **book search suggestions** when you type a title into "Add Book," and (b) **book cover images** for AI recommendations.

**Where it comes from:** `https://openlibrary.org` — a free, open-source book catalog run by the Internet Archive, containing millions of books.

**How we use it:**
- When you start typing a book title, we send your query to Open Library and it returns matching books with titles, authors, and cover images — like a search autocomplete.
- When the AI generates book recommendations, we ask Open Library for the cover image of each recommended book.

No API key required — this service is entirely free and open.

---

### 5. Google Books API
**What it does:** A **fallback cover image** source. If Open Library does not have a cover for a book, we try Google Books next.

**Where it comes from:** `https://www.googleapis.com/books` — Google's massive book database.

**How we use it:** Only used as a secondary attempt when Open Library comes up empty. This means most book covers are found through one of these two sources combined.

---

### 6. Anthropic Claude API (AI Recommendations)
**What it does:** Powers the **AI book recommendations** feature. It reads your personal book library — specifically your "Want to Read" list — and generates 10 personalized book recommendations tailored to your taste.

**Where it comes from:** `https://anthropic.com` — the company that makes Claude, the same AI assistant used to build this app. Requires a paid API key.

**How we use it:**
1. We look at your library and build a prompt (a description) like: "This user wants to read these books: [list]. Recommend 10 books that complement their taste."
2. We send that prompt to Claude and it responds with a JSON list of 10 recommendations including title, author, genre, and a short reasoning for each pick.
3. We then fetch cover images for each recommended book from Open Library and Google Books.
4. The final list is **cached** in your Supabase profile so we do not need to call the AI (which costs money per use) every time you open the page. The cache refreshes automatically when your library changes.

**Why Claude specifically?**
- It produces high-quality, thoughtful recommendations — not just the most popular books in a genre, but genuinely considered suggestions based on the specific books in your list.
- As the AI powering this development session, we already had a working integration with it.

---

## Image Proxy

One small but important detail: when we display book cover images from Open Library, Google Books, or the NYT, we route them through our own `/api/image` endpoint first. This is called an **image proxy**.

**Why?** Security and reliability. Without it, browsers would sometimes block images from external sources for security reasons. By routing them through our own server, we also control caching (images are stored for 24 hours) so the app loads faster on repeat visits.

---

## Dark Mode & Theme

The app supports **light mode and dark mode**, toggled from the Settings page. Your preference is saved in your browser's **local storage** — a small key-value store that browsers provide for apps to remember simple settings. It persists between sessions on the same device but is not synced across devices (e.g., switching your phone to dark mode will not affect your laptop).

When the toggle is flipped, a CSS class called `dark` is added to the root of the page, which triggers a set of color overrides that change backgrounds, text, and borders throughout the entire app.

---

## How It All Connects — The Flow of a Typical Action

To make it concrete, here is what happens when you add a new book:

1. You type a title in the search box on the Books page.
2. The app sends your query to **Open Library** (via our API route) and shows you matching book suggestions.
3. You select a book. Its title, author, and cover image are pre-filled.
4. You click Save. The app sends the book data to **Supabase**, which writes it to your `books` table.
5. The new book appears instantly in your library.
6. Later, when you visit the Dashboard, the **Claude AI** notices your library has changed and flags that new recommendations are available.
7. When you click "Refresh," Claude reads your updated library and generates new picks. Cover images are fetched from **Open Library** and **Google Books**, and the full list is saved back to **Supabase** for next time.

Every feature in the app follows a similar pattern: user action → our code → external service or database → result displayed to you.

---

## Summary of Services

| Service | What We Use It For | Cost |
|---|---|---|
| GitHub | Code storage and version history | Free |
| Vercel | Hosting and automatic deployment | Free tier |
| Supabase | Database, user accounts, file storage | Free tier |
| Free Dictionary API | Word definitions | Free |
| Wordnik API | Word of the Day | Free tier |
| NYT Books API | Bestseller lists | Free tier |
| Open Library API | Book search and cover images | Free |
| Google Books API | Fallback cover images | Free |
| Anthropic Claude API | AI book recommendations | Pay per use |
