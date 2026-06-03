# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Local development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Production server
```

No test suite is configured. Lint is via ESLint 9 (`eslint.config.mjs`).

## Stack

- **Next.js 16** (App Router, React 19) — all pages are Server Components by default; client components are explicitly marked `'use client'`
- **TypeScript 5** with strict mode and `@/*` path alias (maps to project root)
- **Neon PostgreSQL** — accessed via `@neondatabase/serverless` using SQL template literals directly in Server Components and API routes
- **Tailwind CSS v4** — dark theme only, custom CSS properties defined in `app/globals.css`
- **shadcn/ui** — component library under `components/ui/`
- **Vercel** — hosting; Vercel Blob for image storage

## Architecture

### Data Flow

1. Server Components query Neon directly with `sql\`\`` template literals — no ORM, no abstraction layer
2. Pages use the `'use cache'` directive (Next.js 16 component-level caching) — cache life is configured in `next.config.ts` (30-day revalidation, 1-year storage)
3. Steam Community Market prices are fetched at runtime via three API routes under `app/api/`
4. Static game data (skins, crates, collections, agents, etc.) lives as JSON files in `lib/internal/api/en/`
5. Visitor tracking uses a UUID cookie set in `proxy.ts` (middleware) and fed into Signakit feature flags

### Page Pattern

Every category follows the same two-level structure:
- `app/[category]/page.tsx` — browse/listing page
- `app/[category]/[slug]/page.tsx` (sometimes nested further) — detail page

Categories: `weapons`, `cases`, `collections`, `gloves`, `agents`, `patches`, `pins`, `souvenir-packages`

### Database Types

`types/database.ts` — auto-generated Supabase types (do not hand-edit). `types/custom.ts` — manual type aliases derived from those.

### Styling Conventions

- Tailwind v4 with CSS custom properties — do not use Tailwind v3 syntax that has changed
- No semicolons, single quotes, tab width 2, line width 120 (Prettier — see `prettier.config.js`)
- Color palette tokens (background, secondary, tertiary, quaternary) defined in `globals.css` `:root`

### Key Environment Variables

```
DATABASE_URL              # Neon PostgreSQL connection string
STEAM_API_KEY             # Steam API key
STEAM_APP_ID=730          # CS2 app ID (constant)
BLOB_READ_WRITE_TOKEN     # Vercel Blob Storage
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
SIGNAKIT_SDK_KEY
```
