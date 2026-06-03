# CS2 Skins DB — Rebuild / Improvement PRD

> Living planning document. Each section identifies the problem, the recommendation, and discrete action items.

---

## 0. JSON Source Data — Structure Reference

Sampled the first 1–2 items from every file in `internal/api/en/`. Key findings that directly inform the DB design and sync pipeline.

### Common shape across all item types

Every item has:
- `id` — string, prefixed by type (e.g. `"skin-e757fd7191f9"`, `"crate-1210"`, `"agent-4613"`). **This is the canonical game identifier and should be the upsert key.**
- `def_index` — Steam's internal integer/string index
- `name`, `description`, `image` (Steam CDN URL)
- `rarity: { id, name, color }` — embedded object, same structure everywhere
- `market_hash_name` — exact name used by the Steam Market API (currently missing from most DB tables, but critical for pricing lookups)

### File-by-file breakdown

**`skins.json`** — contains BOTH weapon skins AND gloves in one array, distinguished by `category.id`:
- Gloves: `category.id = "sfui_invpanel_filter_gloves"`
- Weapons: all other category IDs (rifles, pistols, etc.)
- Each item carries: `weapon: { id, weapon_id (int), name }`, `pattern: { id, name }`, `min_float`, `max_float`, `stattrak`, `souvenir`, `paint_index`, `wears[]`, `team: { id, name }`
- Relationships are embedded: `collections: [{ id, name, image }]` and `crates: [{ id, name, image }]` — tells us exactly which crates/collections each skin belongs to
- No separate gloves file; gloves live here

**`crates.json`** — cases, souvenir packages, graffiti boxes, capsules:
- `type`: null or a string identifying subtype
- `first_sale_date`: `"YYYY/MM/DD"`
- `contains: []` — array of skin objects (`{ id, name, rarity, paint_index, image }`)
- `contains_rare: []` — same structure, for the rare "gold" drop slot
- `rental`: boolean (unused in practice)

**`collections.json`** — skin collections (e.g., "The Huntsman Collection"):
- `crates: [{ id, name, image }]` — which cases drop from this collection
- `contains: []` — full list of skins in the collection (same skin objects as above)
- **No top-level `image` field on the collection itself** — collection images in the current DB come from a separate source

**`agents.json`**:
- `collections: [{ id, name, image }]` — the agent belongs to one collection (array but typically one item)
- `team: { id, name }` — "terrorists" or "counter-terrorists"
- `model_player`: 3D model path (not currently stored in DB)

**`keychains.json`** — no current DB table:
- `collections: [{ id, name, image }]` — belongs to keychain charm collections
- Structure very similar to patches

**`stickers.json`** — no current DB table:
- `type`: string (e.g., "Event", "Team", "Graffiti")
- `effect`: string (e.g., "Other", "Foil", "Holo")
- `tournament: { id, name }` or null — links sticker to a tournament event
- `crates: []` and `collections: []` — sticker capsules

**`patches.json`** — simple, no crates/collections relationship in JSON

**`collectibles.json`** — coins, trophies:
- `genuine`: boolean
- `type`: string or null (e.g., "Tournament Finalist Trophy")

**`graffiti.json`**:
- `crates: []` — which graffiti boxes contain it
- `market_hash_name`: always set (graffiti is tradeable)

**`music_kits.json`**:
- `exclusive`: boolean (some kits are not for sale)
- `market_hash_name`: may be null for exclusive kits

**`base_weapons.json`** — the base weapon definitions (no skins):
- `category: { id, name }` — "Pistols", "Rifles", "SMGs", etc.
- Provides `name`, `description`, `image`, and `category` only — does **not** contain game stats
- The current `weapons` table has ~20 stat columns (`dam_short_armor`, `ttk_long`, `armor_pen`, `fire_rate`, etc.) used on `/weapons/[weapon]` detail pages. **These stats are not in any JSON file and must be preserved from the existing DB.** See Section 1 — Weapons Table note.

**`keys.json`** — case keys:
- `crates: []` — which cases this key opens
- `marketable`: boolean

**`tools.json`** — Name Tags, Storage Units, etc. (utility items, no relationships)

### Critical observations

1. **`skins.json` mixes skins and gloves** — split at ingest time by `category.id`
2. **`market_hash_name` must be added to every DB table** — it's the correct identifier for Steam pricing API calls, far more reliable than constructing names manually
3. **All relationships are embed-and-derive** — every item embeds its crate/collection memberships, so join tables can be fully populated from the JSON without separate lookups
4. **`id` field is stable across updates** — safe to use as the upsert key for incremental sync
5. **New tables needed**: `keychains`, `stickers`, `graffiti`, `music_kits`, `keys`, `tools`
6. **Stickers have a `tournament` dimension** — consider a `tournaments` lookup table if sticker browsing by event is a desired feature

---

## 1. Database: Schema, Relationships & ORM Decision

### Current State

The schema was migrated from Supabase to Neon with no ORM added. Several structural problems are visible from `types/database.ts` and confirmed by the JSON source data:

**No FK constraints on most tables.** The only declared relationship is `skins_collections → collections` and `skins_collections → skins` (via `skins.weapon_id`, which is itself unusual — see below). Every other table has `Relationships: []`.

**Dual-ID problem on `skins` and `gloves`.** These tables have both `id` (uuid, PK) and `weapon_id` (string, game identifier). The `skins_collections` join table references `skins.weapon_id` rather than `skins.id`, which is fragile. The distinction between these two identifiers needs to be explicit and consistent.

**Denormalized rarity data.** `skins`, `gloves`, `agents`, `patches`, and `collectables` all store `rarity_id`, `rarity_name`, and `rarity_color` directly. The `rarities` table exists but is never joined to via FK. Any rarity name/color change requires updating every row in every table.

**JSON blobs for relational data.**
- `crates.contains` and `crates.contains_rare` are `Json` columns storing skin references
- `skins.in_cases` and `gloves.in_cases` are `Json` columns storing case references
- `skins.case_ids` and `gloves.case_ids` are `string[]` columns storing case IDs

These should be proper join tables to support filtering, indexing, and query efficiency.

**Missing indexes.** Pages query by `weapon_slug + short_slug` (skin detail), `collections_slug` (collection skins), `weapon_id_ref` (gloves), etc. None of these have declared indexes.

**`agents` table** stores `collections_name` and `collections_slug` as strings rather than a FK to `collections`.

### Weapons Table — Special Case

The `weapons` table (lines 537–638 of `types/database.ts`) contains ballistic stats used on `/weapons/[weapon]/page.tsx`: `dam_short_armor`, `dam_long_armor`, `ttk_short`, `ttk_long`, `armor_pen`, `fire_rate`, `mag_size`, `reload_time`, `movement_speed`, `raw_damage`, `kill_reward`, `price`, and more. **These values are not present in any of the JSON source files** — they were sourced separately (likely manually entered or from a third-party stats API).

**Plan:** Before dropping any tables, export the full `weapons` table to `scripts/data/weapons-stats-backup.json`. The Drizzle schema will keep this table intact. `base_weapons.json` will only supplement it with `description` and `category` for any base weapons currently missing those fields.

### ORM Recommendation: Drizzle ORM

**Recommendation: Add Drizzle ORM.** It's the right choice here because:
- Native Neon integration (`drizzle-orm/neon-http`)
- Schema-as-code with TypeScript types auto-generated — replaces the manually maintained `types/database.ts`
- Lightweight, no runtime magic, still emits plain SQL
- Migration system (`drizzle-kit`) makes schema changes trackable in git

Alternative (no ORM): Keep raw SQL but add a `db/` layer that at minimum centralizes the `neon()` client instantiation (currently each query creates a new client).

### Proposed Clean Schema

```
rarities          (id PK, rarity_id, name, color, order, slug)
weapons           (id PK, weapon_id, name, slug, type, image, ...stats)
categories        (id PK, name, slug)
teams             (id PK, team_id, name, slug)
patterns          (id PK, pattern_id, name, slug)
wears             (id PK, name, slug)
collections       (id PK [= JSON id], name, slug, image, featured)
tournaments       (id PK, name)                            ← NEW

skins             (id PK [= JSON id], name, slug, short_slug, short_name,
                   weapon_id FK→weapons, category_id FK→categories,
                   pattern_id FK→patterns, rarity_id FK→rarities,
                   team_id FK→teams, description, paint_index,
                   min_float, max_float, stattrak, souvenir,
                   market_hash_name,                       ← ADD
                   image, featured)
  -- gloves are also in this table, category differentiates them
  -- DROP: weapon_id_ref, weapon_name, weapon_slug, weapon_type,
           collections_slug, collections_name, rarity_name, rarity_color,
           in_cases (JSON), case_ids (array)

crates            (id PK [= JSON id], name, slug, short_name, type,
                   description, first_sale_date,
                   market_hash_name,                       ← ADD
                   image)
  -- DROP: contains (JSON), contains_rare (JSON)

agents            (id PK [= JSON id], name, slug, short_name, sub_name,
                   rarity_id FK→rarities, team_id FK→teams,
                   description, market_hash_name,          ← ADD
                   image, unique_id)
  -- DROP: collections_name, collections_slug, rarity_name, rarity_color

patches           (id PK [= JSON id], name, slug, short_name,
                   rarity_id FK→rarities, description,
                   market_hash_name,                       ← ADD
                   image, unique_id)
  -- DROP: rarity_name, rarity_color

collectables      (id PK [= JSON id], name, slug, short_name,
                   rarity_id FK→rarities, description, type, genuine,
                   market_hash_name,                       ← ADD
                   image, unique_id)
  -- DROP: rarity_name, rarity_color

keychains         (id PK, name, slug, rarity_id FK→rarities,  ← NEW TABLE
                   description, market_hash_name, image, def_index)

stickers          (id PK, name, slug, rarity_id FK→rarities,  ← NEW TABLE
                   description, type, effect,
                   tournament_id FK→tournaments,
                   market_hash_name, image, def_index)

graffiti          (id PK, name, slug, rarity_id FK→rarities,  ← NEW TABLE
                   description, market_hash_name, image, def_index)

music_kits        (id PK, name, slug, rarity_id FK→rarities,  ← NEW TABLE
                   description, exclusive, market_hash_name, image, def_index)

keys              (id PK, name, slug, marketable,             ← NEW TABLE
                   description, market_hash_name, image, def_index)

-- Join tables (replace all JSON blobs and array columns)
skin_crates       (skin_id FK→skins, crate_id FK→crates, is_rare BOOL)
skin_collections  (skin_id FK→skins, collection_id FK→collections)
  -- replaces current skins_collections (which uses weapon_id, not id)
agent_collections (agent_id FK→agents, collection_id FK→collections)
keychain_collections (keychain_id FK→keychains, collection_id FK→collections)
sticker_crates    (sticker_id FK→stickers, crate_id FK→crates)
sticker_collections (sticker_id FK→stickers, collection_id FK→collections)
graffiti_crates   (graffiti_id FK→graffiti, crate_id FK→crates)
key_crates        (key_id FK→keys, crate_id FK→crates)
collection_crates (collection_id FK→collections, crate_id FK→crates)
```

### Action Items

- [ ] **A1.1** — Decide: Drizzle ORM vs. raw SQL with centralized client. Drizzle recommended — define the schema above in `db/schema.ts`, use `drizzle-kit` for migrations.
- [ ] **A1.2** — Add `market_hash_name` column to `skins`, `crates`, `agents`, `patches`, `collectables` (and all new tables). This enables correct Steam pricing API calls.
- [ ] **A1.3** — Use the JSON `id` field (e.g., `"skin-e757fd7191f9"`) as the primary key on all tables, replacing the Supabase-generated UUIDs. This makes upserts trivial and the IDs human-readable.
- [ ] **A1.4** — Create all join tables listed above; drop JSON blob columns (`crates.contains`, `skins.in_cases`, `skins.case_ids`, `gloves.in_cases`, `gloves.case_ids`).
- [ ] **A1.5** — Remove denormalized columns: `rarity_name`, `rarity_color` from all tables; `weapon_name`, `weapon_slug`, `weapon_type`, `weapon_id_ref`, `collections_name`, `collections_slug` from `skins`/`agents`.
- [ ] **A1.6** — Merge `gloves` table into `skins` — they come from the same JSON source and have identical shape. Category column differentiates them at query time.
- [ ] **A1.7** — Add DB indexes: `skins(slug)`, `skins(short_slug, weapon_id)`, `crates(slug)`, `agents(slug)`, `patches(slug)`, and all FK columns on join tables.
- [ ] **A1.8** — Centralize the Neon client: create `lib/db.ts` that exports a single `sql` instance, rather than calling `neon(process.env.DATABASE_URL!)` inside every `getData()` function.
- [ ] **A1.9** — Create new tables: `keychains`, `stickers`, `graffiti`, `music_kits`, `keys`, `tournaments`.

---

## 2. Data Update Pipeline (New Skins from JSON)

### Current State

The `internal/api/en/` directory contains up-to-date JSON exports from the CS2 API. The database is 6–9 months behind. Images in the JSON point to Steam CDN URLs (akamai.steamstatic.com). The app serves images from Vercel Blob.

### Files and What They Map To

| JSON file | Target DB table(s) | Notes |
|---|---|---|
| `skins.json` | `skins` (all rows, incl. gloves) | Split by `category.id` at query time |
| `crates.json` | `crates`, `skin_crates` | `souvenir_packages` merged into `crates` by `type` |
| `collections.json` | `collections`, `skin_collections`, `collection_crates` | No collection image in JSON — keep current Blob images |
| `agents.json` | `agents`, `agent_collections` | |
| `patches.json` | `patches` | No relationship arrays in JSON |
| `collectibles.json` | `collectables` | |
| `keychains.json` | `keychains`, `keychain_collections` | New table |
| `stickers.json` | `stickers`, `sticker_crates`, `sticker_collections`, `tournaments` | New table |
| `graffiti.json` | `graffiti`, `graffiti_crates` | New table |
| `music_kits.json` | `music_kits` | New table |
| `keys.json` | `keys`, `key_crates` | New table |
| `base_weapons.json` | `weapons` (base info only) | Stats columns sourced separately |
| `tools.json` | Skip or a simple `tools` table | Low user value |

### Vercel Blob URL Structure

Existing Blob images follow a deterministic naming convention derived from the `original.image_inventory` field in each JSON item:

```
Base URL:  https://zoosqzb9kxuqwmrn.public.blob.vercel-storage.com/
Structure: {category_folder}/{last_segment_of_image_inventory}_png.png

Examples:
  original.image_inventory = "econ/characters/customplayer_tm_balkan_variantk"
  → agents/customplayer_tm_balkan_variantk_png.png

  original.image_inventory = "econ/weapon_cases/crate_operation_ii"
  → cases/crate_operation_ii_png.png

  original.image_inventory = "econ/default_generated/weapon_m4a1_gs_m4a4_chopper_ghost_light"
  → skins/weapon_m4a1_gs_m4a4_chopper_ghost_light_png.png
```

The `_png.png` double extension comes from the [ByMykel counter-strike-image-tracker](https://github.com/ByMykel/counter-strike-image-tracker) convention — that repo names files as `{name}_png.png` in its path structure, and the original upload preserved those filenames.

**Category folder mapping:**

| Item type | Blob folder |
|---|---|
| Skins & gloves | `skins/` |
| Agents | `agents/` |
| Cases / crates | `cases/` |
| Collections | `collections/` |
| Patches | `patches/` |
| Pins / collectibles | `collectibles/` |
| Keychains | `keychains/` (new) |
| Stickers | `stickers/` (new) |
| Graffiti | `graffiti/` (new) |
| Music kits | `music_kits/` (new) |

**Key implication for the sync script:** The expected Blob path for any item can be computed locally from `original.image_inventory` — no network call to Blob needed to check existence. Simply derive the path, compare to the current `image` column in the DB. If they match, the image is already uploaded; skip the download step.

### Update Pipeline Design

The update process needs to be a repeatable script (not a one-time migration). It should be idempotent — running it again on the same data should produce no duplicates.

**Image handling per item:**
1. Derive expected Blob path from `original.image_inventory` using the convention above
2. If the item already exists in DB and `image` column equals expected Blob URL → skip
3. If new or image is still a Steam CDN URL → download from `image` field in JSON, upload to Blob at the derived path with `access: 'public'`, store Blob URL in DB

**New item categories:** `keychains`, `stickers`, `graffiti`, `music_kits` exist in the JSON but have no DB table or app pages yet. All will be added in this rebuild pass since the sync script has to handle them anyway.

### Action Items

- [ ] **A2.1** — Before starting the rebuild: export the current `weapons` table to `scripts/data/weapons-stats-backup.json` using `pg_dump` or a simple query script. This is the only data not reconstructable from JSON.
- [ ] **A2.2** — Write `scripts/sync-db.ts` that reads each JSON file and diffs against existing DB rows by game `id`. Output a report of new vs. existing item counts per category before touching anything.
- [ ] **A2.3** — Add image handling to the sync script: derive Blob path from `original.image_inventory` using the `{category}/{last_segment}_png.png` convention. If item's current `image` already matches the expected Blob URL → skip. Otherwise download from Steam CDN and upload via `@vercel/blob` `put()` with `access: 'public'`. Process in batches of ~10 to avoid rate limiting.
- [ ] **A2.4** — Implement upsert logic (`INSERT ... ON CONFLICT (id) DO UPDATE SET ...`) so the script is safe to re-run incrementally.
- [ ] **A2.5** — Populate all join tables from the embedded relationship arrays in each JSON item (e.g., each skin's `crates[]` feeds `skin_crates`, each skin's `collections[]` feeds `skin_collections`). Use `ON CONFLICT DO NOTHING` on join tables.
- [ ] **A2.6** — Store `market_hash_name` from JSON on every row during sync — this replaces manual name-construction in the pricing API routes.
- [ ] **A2.7** — Run the sync against a staging/preview deploy first; verify images resolve, pricing API works with `market_hash_name`, and join table queries return correct results.
- [ ] **A2.8** — Document the update process in `CLAUDE.md`: how to pull fresh JSON, run the sync, and deploy.

---

## 3. Vercel Usage: Eliminating Edge Requests & ISR Reads

### Current State

The app added `'use cache'` to pages to reduce ISR reads. However, several patterns still cause unnecessary edge / serverless invocations:

**The middleware (`proxy.ts`) runs on `'/'` and sets a cookie.** Any middleware that mutates the response (setting cookies) prevents that page from being served from cache as a pure static asset. Every request to the homepage becomes an edge function invocation. This is the most likely driver of elevated edge request counts.

**`'use cache'` placement in `generateStaticParams`.** The `generateStaticParams` function in `app/weapons/[weapon]/[skin]/page.tsx` has `'use cache'` inside it — this runs at build time and doesn't need caching in the usual sense. The cache directive should be on the page-level `getData()` function, which it already has.

**`generateStaticParams` enables full static generation** for skin detail pages, which is correct. But if `dynamicParams` is not explicitly set to `false`, Next.js will attempt to SSR any slug that wasn't in the params list at build time. New skins added after a deploy would fall through to dynamic rendering until the next build.

**The `images: { unoptimized: true }` config** is intentional (bypasses Image Optimization API costs), which is the right call for Blob-hosted images that are already optimized.

### Recommended Strategy

For a content site where data changes only when you deploy a new update:

1. **Remove or refactor the cookie middleware.** The visitor ID cookie exists for Signakit analytics. If Signakit tracking is not critical, remove the middleware entirely. If it is needed, explore setting the cookie client-side via a small `'use client'` component in the layout, which avoids the middleware edge invocation completely.

2. **Enforce fully static pages** with `export const dynamic = 'error'` on all listing and detail pages. This causes a build error if any page accidentally becomes dynamic, catching regressions early.

3. **Set `dynamicParams = false`** on all `generateStaticParams` pages so unknown slugs return 404 immediately from the edge cache rather than triggering SSR.

4. **The Steam pricing API calls are already client-side** (`MarketTable.tsx` uses `useEffect` + `fetch`). These hit your `/api/get-market-prices` route, which is a serverless function — that's fine and expected. These don't count against ISR reads.

5. **Vercel Blob cache headers** — Blob Storage automatically serves files with `Cache-Control: public, max-age=31536000, immutable` when you use `put()` with `access: 'public'`. Verify this is set correctly on your existing uploads. If it isn't, re-upload with the correct access setting or use the Vercel Blob `copy()` operation to reset headers.

### Action Items

- [ ] **A3.1** — Refactor `proxy.ts`: move visitor ID cookie logic to a client-side component in `app/layout.tsx` and remove the middleware entirely. Verify Signakit still receives the visitor ID.
- [ ] **A3.2** — Add `export const dynamic = 'error'` to all category listing pages (weapons, cases, collections, agents, gloves, patches, pins, souvenir-packages) and the homepage.
- [ ] **A3.3** — Add `export const dynamicParams = false` to all pages with `generateStaticParams`.
- [ ] **A3.4** — Verify Vercel Blob upload settings: confirm `access: 'public'` is set, and check response headers via `curl -I <blob-url>` to confirm `Cache-Control: public, max-age=31536000, immutable`.
- [ ] **A3.5** — After removing middleware, do a test deploy and check Vercel analytics: edge requests and function invocations should drop significantly.
- [ ] **A3.6** — Consider using `next build` output as a baseline and `vercel build --debug` to audit which routes are static vs. dynamic before and after changes.

---

## 4. Folder Structure & Route Audit

### Current Routes

```
/                              → homepage
/weapons                       → all weapons grouped by type
/weapons/[weapon]              → all skins for a weapon
/weapons/[weapon]/[skin]       → skin detail
/cases                         → all cases
/cases/[crate]                 → case detail (contents)
/cases/[crate]/[slug]          → ??? (unclear what this nested route is)
/collections                   → all collections
/collections/[collection]      → collection detail
/agents                        → all agents
/agents/[slug]                 → agent detail
/gloves                        → all gloves
/gloves/[glove]                → glove detail
/patches                       → all patches
/patches/[slug]                → patch detail
/pins                          → all pins
/pins/[slug]                   → pin detail
/souvenir-packages             → all souvenir packages
/souvenir-packages/[slug]      → souvenir package detail
```

### Issues

**`/cases/[crate]/[slug]` is confusing.** A case is identified by `[crate]` but then has a sub-slug. It's unclear whether this models a case detail + skin detail within the case, or something else. This should be audited to confirm the intent and whether the route structure matches user expectations.

**Missing categories from JSON data:** The JSON contains `stickers`, `graffiti`, `keychains`, and `music_kits` that have no pages. These represent real CS2 item types users might search for.

**`/weapons/[weapon]` (weapon-level page)** lists all skins for that weapon. This is correct. However, the `weapons` table contains ballistic stats — consider whether a "weapon stats" section belongs on this page vs. just the skin listing.

**No 404 page** (`app/not-found.tsx`) for graceful handling of invalid slugs.

**`sitemap.ts`** dynamically generates the sitemap — verify it covers all categories and uses absolute URLs correctly.

### Action Items

- [ ] **A4.1** — Audit `/cases/[crate]/[slug]/page.tsx` — determine what `[slug]` represents and rename the route segment to something descriptive (`/cases/[crate]/[skin]` or similar).
- [ ] **A4.2** — Create `app/not-found.tsx` with a branded 404 page.
- [ ] **A4.3** — Decide which missing categories (stickers, keychains, graffiti, music kits) to add in this iteration. Each requires: DB table, data sync, listing page, detail page, sitemap entry.
- [ ] **A4.4** — Audit `app/sitemap.ts` — confirm all routes are included and URLs are absolute (`https://cs2skinsdb.com/...`).
- [ ] **A4.5** — Consider adding weapon-type sub-routes for SEO (e.g., `/weapons/rifles`, `/weapons/pistols`) as landing pages — currently you filter client-side on the single `/weapons` page.

---

## 5. Prioritized Order of Attack

Decision confirmed: **start fresh with Drizzle ORM on a new Neon DB** rather than migrating in place.

| Priority | Action | Reason |
|---|---|---|
| 1 | Export weapons stats backup (A2.1) | Only data not in JSON — must do first |
| 2 | Define Drizzle schema (A1.1, A1.9) | Everything else depends on this |
| 3 | Write & run sync script — dry run (A2.2) | Validate counts before any writes |
| 4 | Image sync to Blob (A2.3) | Biggest time cost; can run overnight |
| 5 | DB upsert + join tables (A2.4–A2.6) | Populates the new DB |
| 6 | Re-import weapons stats (A2.1) | Restore from backup into new schema |
| 7 | Vercel middleware removal (A3.1–A3.3) | Quick win on billing; low risk |
| 8 | Vercel Blob cache audit (A3.4–A3.5) | Confirm headers are correct post-sync |
| 9 | Update app queries to new schema | Pages need to use FKs + join tables |
| 10 | New item category pages (A4.3) | Keychains, stickers, graffiti, music kits |
| 11 | Route audit + 404 page (A4.1, A4.2) | Polish |
| 12 | Update sitemap (A4.4) | Include new categories |
