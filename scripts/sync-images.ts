/**
 * Image Sync Script
 *
 * Brings all DB image URLs up to date with Vercel Blob storage.
 *
 * Usage:
 *   npm run images:sync              → dry run (report only, no uploads)
 *   npm run images:sync -- --upload  → update DB + upload missing images
 *
 * Naming conventions discovered in Blob:
 *   Skins (old):    skins/{weapon_id}_{pattern_id}_light_png.png
 *   Skins (new):    skins/{short_slug}.png
 *   Cases:          cases/{image_inventory_last_segment}_png.png
 *   Agents:         agents/{image_inventory_last_segment}_png.png
 *   Patches:        patches/{image_inventory_last_segment}_png.png
 *   Collectibles:   collectibles/{image_inventory_last_segment}_png.png
 *   Collections:    collections/{image_inventory_last_segment}_png.png
 *   Keychains:      keychains/{image_inventory_last_segment}_png.png  (not yet uploaded)
 *
 * Deferred (pages not built yet):
 *   graffiti, stickers, music_kits — run this script again when those pages ship.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { list, put } from '@vercel/blob'
import { eq, not, like } from 'drizzle-orm'
import { sql as drizzleSql } from 'drizzle-orm'
import { db } from '../db'
import * as schema from '../db/schema'

const BLOB_BASE = 'https://zoosqzb9kxuqwmrn.public.blob.vercel-storage.com'
const DATA_DIR = join(process.cwd(), 'internal/api/en')
const DRY_RUN = !process.argv.includes('--upload')
const CONCURRENCY = 5

function readJson<T>(filename: string): T[] {
  return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf-8'))
}

// ─── Blob helpers ─────────────────────────────────────────────────────────────

/** List all blobs under a prefix, returns Set of pathnames */
async function listBlobPaths(prefix: string): Promise<Set<string>> {
  const paths = new Set<string>()
  let cursor: string | undefined
  do {
    const result = await list({ prefix, limit: 1000, cursor })
    for (const blob of result.blobs) paths.add(blob.pathname)
    cursor = result.cursor
    if (!result.hasMore) break
  } while (cursor)
  return paths
}

async function downloadAndUpload(
  steamUrl: string,
  blobPath: string,
  contentType = 'image/png',
): Promise<string> {
  const res = await fetch(steamUrl)
  if (!res.ok) throw new Error(`HTTP ${res.status} from Steam CDN`)
  const buffer = await res.arrayBuffer()
  try {
    const result = await put(blobPath, buffer, { access: 'public', contentType, cacheControlMaxAge: 31536000 })
    return result.url
  } catch (err: any) {
    // File already exists in Blob — the computed URL is correct, treat as success
    if (err?.message?.includes('already exists')) {
      return `${BLOB_BASE}/${blobPath}`
    }
    throw err
  }
}

async function concurrentMap<T>(
  items: T[],
  fn: (item: T, i: number) => Promise<void>,
  size = CONCURRENCY,
) {
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size)
    await Promise.allSettled(batch.map((item, j) => fn(item, i + j)))
    process.stdout.write(`  ${Math.min(i + size, items.length)}/${items.length}\r`)
  }
  process.stdout.write('\n')
}

// ─── Summary ─────────────────────────────────────────────────────────────────

async function printSummary() {
  console.log('\n── DB image URL breakdown ─────────────────────────────────────')
  const tables = [
    { label: 'skins', table: schema.skins },
    { label: 'crates', table: schema.crates },
    { label: 'agents', table: schema.agents },
    { label: 'patches', table: schema.patches },
    { label: 'collectables', table: schema.collectables },
    { label: 'keychains', table: schema.keychains },
  ]
  for (const { label, table } of tables) {
    const [r] = await db
      .select({
        total: drizzleSql<number>`count(*)::int`,
        blob: drizzleSql<number>`count(*) filter (where image like '%blob.vercel%')::int`,
        steam: drizzleSql<number>`count(*) filter (where image like '%akamai%' or image like '%cdn.steam%')::int`,
        nullImg: drizzleSql<number>`count(*) filter (where image is null)::int`,
      })
      .from(table)
    console.log(
      `  ${label.padEnd(14)} total:${String(r.total).padStart(5)}  blob:${String(r.blob).padStart(5)}  steam:${String(r.steam).padStart(5)}  null:${r.nullImg}`,
    )
  }
}

// ─── Phase 1: Skins ──────────────────────────────────────────────────────────
// Two naming conventions exist in Blob:
//   (A) {weapon_id}_{pattern_id}_light_png.png  — original bulk upload
//   (B) {short_slug}.png                         — later individual uploads

async function syncSkins() {
  console.log('\n── Phase 1: Skins ──────────────────────────────────────────────')
  console.log('Listing Blob skins/ ...')
  const blobPaths = await listBlobPaths('skins/')
  console.log(`  ${blobPaths.size} images in Blob`)

  const allSkins = await db
    .select({
      id: schema.skins.id,
      shortSlug: schema.skins.shortSlug,
      weaponId: schema.skins.weaponId,
      patternId: schema.skins.patternId,
      image: schema.skins.image,
    })
    .from(schema.skins)

  const needsDbUpdate: { id: string; newUrl: string }[] = []
  const needsUpload: typeof allSkins = []

  for (const skin of allSkins) {
    if (skin.image?.includes('blob.vercel')) {
      // Already has a Blob URL — keep it
      continue
    }

    // Try convention A: {weapon_id}_{pattern_id}_light_png.png
    const pathA = skin.weaponId && skin.patternId
      ? `skins/${skin.weaponId}_${skin.patternId}_light_png.png`
      : null
    // Try convention B: {short_slug}.png
    const pathB = `skins/${skin.shortSlug}.png`

    if (pathA && blobPaths.has(pathA)) {
      needsDbUpdate.push({ id: skin.id, newUrl: `${BLOB_BASE}/${pathA}` })
    } else if (blobPaths.has(pathB)) {
      needsDbUpdate.push({ id: skin.id, newUrl: `${BLOB_BASE}/${pathB}` })
    } else {
      needsUpload.push(skin)
    }
  }

  console.log(`  ${needsDbUpdate.length} skins: Blob image found → DB URL needs update`)
  console.log(`  ${needsUpload.length} skins: not in Blob → need download + upload`)
  if (DRY_RUN && needsUpload.length) {
    console.log('  Sample missing:', needsUpload.slice(0, 8).map((s) => s.shortSlug).join(', '))
  }

  if (DRY_RUN) return

  // Batch DB updates for skins already in Blob
  if (needsDbUpdate.length) {
    console.log(`Updating ${needsDbUpdate.length} skin URLs in DB...`)
    const BATCH = 100
    for (let i = 0; i < needsDbUpdate.length; i += BATCH) {
      const batch = needsDbUpdate.slice(i, i + BATCH)
      await Promise.all(
        batch.map((s) => db.update(schema.skins).set({ image: s.newUrl }).where(eq(schema.skins.id, s.id))),
      )
      process.stdout.write(`  ${Math.min(i + BATCH, needsDbUpdate.length)}/${needsDbUpdate.length}\r`)
    }
    process.stdout.write('\n')
    console.log('  ✓ DB updated')
  }

  // Download and upload missing skins
  if (needsUpload.length) {
    console.log(`Uploading ${needsUpload.length} missing skin images...`)
    await concurrentMap(needsUpload, async (skin) => {
      if (!skin.image) return
      const blobPath = skin.weaponId && skin.patternId
        ? `skins/${skin.weaponId}_${skin.patternId}_light_png.png`
        : `skins/${skin.shortSlug}.png`
      try {
        const url = await downloadAndUpload(skin.image, blobPath)
        await db.update(schema.skins).set({ image: url }).where(eq(schema.skins.id, skin.id))
      } catch (err) {
        console.error(`\n  ✗ ${skin.shortSlug}: ${(err as Error).message}`)
      }
    })
    console.log('  ✓ Skin uploads complete')
  }
}

// ─── Phase 2: Generic category sync ──────────────────────────────────────────
// For all categories where image_inventory drives the Blob filename.
// Checks if each computed Blob URL actually exists; uploads if not.

async function syncCategory(opts: {
  label: string
  blobPrefix: string
  table: any
  idCol: any
  imageCol: any
  jsonFile: string
  jsonFolder: string
}) {
  console.log(`\n── ${opts.label} ─────────────────────────────`)
  console.log(`Listing Blob ${opts.blobPrefix} ...`)
  const blobPaths = await listBlobPaths(opts.blobPrefix)
  console.log(`  ${blobPaths.size} images in Blob`)

  // Load JSON for Steam CDN URLs and image_inventory paths
  const jsonItems = readJson<any>(opts.jsonFile)
  const jsonById = new Map(jsonItems.map((item: any) => [item.id, item]))

  const dbRows = await db
    .select({ id: opts.idCol, image: opts.imageCol })
    .from(opts.table)

  const needsDbUpdate: { id: string; newUrl: string }[] = []
  const needsUpload: { id: string; steamUrl: string; blobPath: string }[] = []

  for (const row of dbRows) {
    const json = jsonById.get(row.id)
    const imageInventory = json?.original?.image_inventory
    if (!imageInventory) continue

    const filename = `${imageInventory.split('/').pop()}_png.png`
    const blobPath = `${opts.blobPrefix}${filename}`
    const expectedUrl = `${BLOB_BASE}/${blobPath}`

    if (blobPaths.has(blobPath)) {
      // Blob has it — update DB if URL differs
      if (row.image !== expectedUrl) {
        needsDbUpdate.push({ id: row.id, newUrl: expectedUrl })
      }
    } else {
      // Not in Blob — queue upload from Steam CDN
      if (json?.image) {
        needsUpload.push({ id: row.id, steamUrl: json.image, blobPath })
      }
    }
  }

  console.log(`  ${needsDbUpdate.length} URL corrections needed in DB`)
  console.log(`  ${needsUpload.length} images need uploading`)

  if (DRY_RUN) return

  if (needsDbUpdate.length) {
    console.log(`Updating ${needsDbUpdate.length} URLs...`)
    await Promise.all(
      needsDbUpdate.map((row) =>
        db.update(opts.table).set({ image: row.newUrl }).where(eq(opts.idCol, row.id)),
      ),
    )
    console.log('  ✓ DB updated')
  }

  if (needsUpload.length) {
    console.log(`Uploading ${needsUpload.length} images...`)
    await concurrentMap(needsUpload, async (item) => {
      try {
        const url = await downloadAndUpload(item.steamUrl, item.blobPath)
        await db.update(opts.table).set({ image: url }).where(eq(opts.idCol, item.id))
      } catch (err) {
        console.error(`\n  ✗ ${item.blobPath}: ${(err as Error).message}`)
      }
    })
    console.log('  ✓ Uploads complete')
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nImage Sync — ${DRY_RUN ? '🔍 DRY RUN (no uploads)' : '📤 UPLOAD MODE'}\n`)

  await printSummary()

  await syncSkins()

  await syncCategory({
    label: 'Crates / Cases',
    blobPrefix: 'cases/',
    table: schema.crates,
    idCol: schema.crates.id,
    imageCol: schema.crates.image,
    jsonFile: 'crates.json',
    jsonFolder: 'cases',
  })

  await syncCategory({
    label: 'Agents',
    blobPrefix: 'agents/',
    table: schema.agents,
    idCol: schema.agents.id,
    imageCol: schema.agents.image,
    jsonFile: 'agents.json',
    jsonFolder: 'agents',
  })

  await syncCategory({
    label: 'Patches',
    blobPrefix: 'patches/',
    table: schema.patches,
    idCol: schema.patches.id,
    imageCol: schema.patches.image,
    jsonFile: 'patches.json',
    jsonFolder: 'patches',
  })

  await syncCategory({
    label: 'Collectables',
    blobPrefix: 'collectibles/',
    table: schema.collectables,
    idCol: schema.collectables.id,
    imageCol: schema.collectables.image,
    jsonFile: 'collectibles.json',
    jsonFolder: 'collectibles',
  })

  await syncCategory({
    label: 'Keychains',
    blobPrefix: 'keychains/',
    table: schema.keychains,
    idCol: schema.keychains.id,
    imageCol: schema.keychains.image,
    jsonFile: 'keychains.json',
    jsonFolder: 'keychains',
  })

  console.log('\n── Final State ──────────────────────────────────────────────')
  await printSummary()

  console.log()
  if (DRY_RUN) {
    console.log('Run `npm run images:sync -- --upload` to execute uploads.\n')
  } else {
    console.log('Image sync complete.\n')
    console.log('Deferred (no pages yet): graffiti, stickers, music_kits\n')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
