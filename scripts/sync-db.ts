/**
 * CS2 DB Sync Script
 *
 * Usage:
 *   npm run db:sync           → dry run (count diff, no writes)
 *   npm run db:sync -- --write  → write mode (upsert all data)
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import slugify from 'slugify'
import { sql as drizzleSql } from 'drizzle-orm'
import { db } from '../db'
import * as schema from '../db/schema'

const DATA_DIR = join(process.cwd(), 'internal/api/en')
const DRY_RUN = !process.argv.includes('--write')
const BLOB_BASE = 'https://zoosqzb9kxuqwmrn.public.blob.vercel-storage.com'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readJson<T>(filename: string): T[] {
  return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf-8'))
}

function toSlug(str: string): string {
  return slugify(str, { lower: true, strict: true })
}

function parseSkinSlug(name: string): { shortName: string; shortSlug: string } {
  const idx = name.indexOf(' | ')
  if (idx !== -1) {
    const shortName = name.slice(idx + 3)
    return { shortName, shortSlug: toSlug(shortName) }
  }
  return { shortName: name, shortSlug: toSlug(name) }
}

/** Derive Blob image URL from original.image_inventory if present */
function blobUrl(folder: string, imageInventory: string | undefined): string | null {
  if (!imageInventory) return null
  const last = imageInventory.split('/').pop()!
  return `${BLOB_BASE}/${folder}/${last}_png.png`
}

async function dbCount(table: any): Promise<number> {
  const [row] = await db.select({ n: drizzleSql<number>`count(*)::int` }).from(table)
  return row.n
}

// ─── Report helpers ───────────────────────────────────────────────────────────

type ReportRow = { category: string; inJson: number; inDb: number; toInsert: number }
const report: ReportRow[] = []

function addReport(category: string, inJson: number, inDb: number) {
  report.push({ category, inJson, inDb, toInsert: Math.max(0, inJson - inDb) })
}

function printReport() {
  const W = { cat: 32, json: 7, db: 7, ins: 7 }
  const line = '─'.repeat(W.cat + W.json + W.db + W.ins + 3)
  console.log()
  console.log(
    `${'Category'.padEnd(W.cat)} ${'JSON'.padStart(W.json)} ${'In DB'.padStart(W.db)} ${'New'.padStart(W.ins)}`
  )
  console.log(line)
  let totalJson = 0
  let totalNew = 0
  for (const row of report) {
    const flag = row.toInsert > 0 ? ' ←' : ''
    console.log(
      `${row.category.padEnd(W.cat)} ${String(row.inJson).padStart(W.json)} ${String(row.inDb).padStart(W.db)} ${String(row.toInsert).padStart(W.ins)}${flag}`
    )
    totalJson += row.inJson
    totalNew += row.toInsert
  }
  console.log(line)
  console.log(`${'TOTAL'.padEnd(W.cat)} ${String(totalJson).padStart(W.json)} ${''.padStart(W.db)} ${String(totalNew).padStart(W.ins)}`)
  console.log()
}

// ─── Rarity pre-seed (must run before any table with rarity_id FK) ────────────

async function seedRarities() {
  const rarityMap = new Map<string, { id: string; name: string; color: string }>()
  const files = ['skins.json', 'agents.json', 'patches.json', 'collectibles.json',
                 'keychains.json', 'stickers.json', 'graffiti.json', 'music_kits.json',
                 'crates.json']
  for (const file of files) {
    const items = readJson<any>(file)
    for (const item of items) {
      if (item.rarity?.id) rarityMap.set(item.rarity.id, item.rarity)
    }
  }
  const rows = [...rarityMap.values()].map((r) => ({
    id: r.id,
    name: r.name,
    color: r.color,
    slug: toSlug(r.name),
    order: 0,
  }))
  if (rows.length) {
    await db.insert(schema.rarities).values(rows).onConflictDoNothing()
    console.log(`  ✓ ${rows.length} rarities seeded`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nCS2 DB Sync — ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '✍️  WRITE MODE'}\n`)

  // In write mode: seed dependency tables first (rarities, weapons, tournaments)
  // before any table that has FK constraints pointing to them.
  if (!DRY_RUN) {
    console.log('Pre-seeding rarities...')
    await seedRarities()

    const weaponsAll = readJson<any>('weapons_table.json')
    console.log(`Syncing weapons stats (${weaponsAll.length})...`)
    await upsertWeapons(weaponsAll)

    const stickersAll = readJson<any>('stickers.json')
    const uniqueTournaments = new Map<string, string>()
    for (const s of stickersAll) {
      if (s.tournament) uniqueTournaments.set(`tournament-${s.tournament.id}`, s.tournament.name)
    }
    console.log(`Syncing tournaments (${uniqueTournaments.size})...`)
    await upsertTournaments(uniqueTournaments)
  }

  // ── 1. Skins + Gloves ──────────────────────────────────────────────────────
  {
    const all = readJson<any>('skins.json')
    const weapons = all.filter((s: any) => s.category.id !== 'sfui_invpanel_filter_gloves')
    const gloves = all.filter((s: any) => s.category.id === 'sfui_invpanel_filter_gloves')
    const dbTotal = await dbCount(schema.skins)
    addReport('Skins (weapons)', weapons.length, 0)
    addReport('Skins (gloves)', gloves.length, 0)
    report[report.length - 2].inDb = dbTotal > weapons.length ? weapons.length : dbTotal
    report[report.length - 1].inDb = Math.max(0, dbTotal - report[report.length - 2].inDb)
    report[report.length - 2].toInsert = Math.max(0, weapons.length - report[report.length - 2].inDb)
    report[report.length - 1].toInsert = Math.max(0, gloves.length - report[report.length - 1].inDb)

    if (!DRY_RUN) {
      console.log(`Syncing skins (${all.length} total)...`)
      await upsertSkins(all)
    }
  }

  // ── 2. Crates ──────────────────────────────────────────────────────────────
  {
    const all = readJson<any>('crates.json')
    addReport('Crates', all.length, await dbCount(schema.crates))
    if (!DRY_RUN) {
      console.log(`Syncing crates (${all.length})...`)
      await upsertCrates(all)
    }
  }

  // ── 3. Collections ─────────────────────────────────────────────────────────
  {
    const all = readJson<any>('collections.json')
    addReport('Collections', all.length, await dbCount(schema.collections))
    if (!DRY_RUN) {
      console.log(`Syncing collections (${all.length})...`)
      await upsertCollections(all)
    }
  }

  // ── 4. Agents ──────────────────────────────────────────────────────────────
  {
    const all = readJson<any>('agents.json')
    addReport('Agents', all.length, await dbCount(schema.agents))
    if (!DRY_RUN) {
      console.log(`Syncing agents (${all.length})...`)
      await upsertAgents(all)
    }
  }

  // ── 5. Patches ─────────────────────────────────────────────────────────────
  {
    const all = readJson<any>('patches.json')
    addReport('Patches', all.length, await dbCount(schema.patches))
    if (!DRY_RUN) {
      console.log(`Syncing patches (${all.length})...`)
      await upsertPatches(all)
    }
  }

  // ── 6. Collectables ────────────────────────────────────────────────────────
  {
    const all = readJson<any>('collectibles.json')
    addReport('Collectables', all.length, await dbCount(schema.collectables))
    if (!DRY_RUN) {
      console.log(`Syncing collectables (${all.length})...`)
      await upsertCollectables(all)
    }
  }

  // ── 7. Keychains ───────────────────────────────────────────────────────────
  {
    const all = readJson<any>('keychains.json')
    addReport('Keychains', all.length, await dbCount(schema.keychains))
    if (!DRY_RUN) {
      console.log(`Syncing keychains (${all.length})...`)
      await upsertKeychains(all)
    }
  }

  // ── 8. Stickers ────────────────────────────────────────────────────────────
  {
    const all = readJson<any>('stickers.json')
    const uniqueTournaments = new Map<string, string>()
    for (const s of all) {
      if (s.tournament) uniqueTournaments.set(`tournament-${s.tournament.id}`, s.tournament.name)
    }
    addReport('Stickers', all.length, await dbCount(schema.stickers))
    addReport('Tournaments', uniqueTournaments.size, await dbCount(schema.tournaments))
    if (!DRY_RUN) {
      // tournaments already inserted in pre-seed phase
      console.log(`Syncing stickers (${all.length})...`)
      await upsertStickers(all)
    }
  }

  // ── 9. Graffiti ────────────────────────────────────────────────────────────
  {
    const all = readJson<any>('graffiti.json')
    addReport('Graffiti', all.length, await dbCount(schema.graffiti))
    if (!DRY_RUN) {
      console.log(`Syncing graffiti (${all.length})...`)
      await upsertGraffiti(all)
    }
  }

  // ── 10. Music Kits ─────────────────────────────────────────────────────────
  {
    const all = readJson<any>('music_kits.json')
    addReport('Music Kits', all.length, await dbCount(schema.musicKits))
    if (!DRY_RUN) {
      console.log(`Syncing music kits (${all.length})...`)
      await upsertMusicKits(all)
    }
  }

  // ── 11. Keys ───────────────────────────────────────────────────────────────
  {
    const all = readJson<any>('keys.json')
    addReport('Keys', all.length, await dbCount(schema.keys))
    if (!DRY_RUN) {
      console.log(`Syncing keys (${all.length})...`)
      await upsertKeys(all)
    }
  }

  // ── 12. Weapons (stats backup — already inserted in pre-seed for write mode) ──
  {
    const all = readJson<any>('weapons_table.json')
    addReport('Weapons (stats)', all.length, await dbCount(schema.weapons))
    // write mode: already handled in pre-seed phase above
  }

  // ── Print report ───────────────────────────────────────────────────────────
  printReport()

  if (DRY_RUN) {
    console.log('Run `npm run db:sync -- --write` to execute the sync.\n')
  } else {
    console.log('Sync complete. Populating join tables...')
    await populateJoinTables()
    console.log('Join tables populated.\n')
  }
}

// ─── Upsert functions (used in --write mode) ──────────────────────────────────

const BATCH = 100

async function upsertInBatches<T>(items: T[], upsertFn: (batch: T[]) => Promise<void>) {
  for (let i = 0; i < items.length; i += BATCH) {
    await upsertFn(items.slice(i, i + BATCH))
    process.stdout.write(`  ${Math.min(i + BATCH, items.length)}/${items.length}\r`)
  }
  process.stdout.write('\n')
}

async function upsertSkins(all: any[]) {
  await upsertInBatches(all, async (batch) => {
    const rows = batch.map((s) => {
      const { shortName, shortSlug } = parseSkinSlug(s.name)
      return {
        id: s.id,
        name: s.name,
        slug: toSlug(s.name),
        shortSlug,
        shortName,
        weaponId: s.weapon.id,
        weaponName: s.weapon.name,
        weaponSlug: toSlug(s.weapon.name),
        categoryId: s.category.id,
        categoryName: s.category.name,
        patternId: s.pattern?.id ?? null,
        patternName: s.pattern?.name ?? null,
        rarityId: s.rarity.id,
        teamId: s.team?.id ?? null,
        description: s.description ?? null,
        paintIndex: s.paint_index ?? null,
        minFloat: s.min_float ?? null,
        maxFloat: s.max_float ?? null,
        stattrak: s.stattrak ?? false,
        souvenir: s.souvenir ?? false,
        marketHashName: s.market_hash_name ?? null,
        image: s.image ?? null,
        legacyModel: s.legacy_model ?? false,
      }
    })
    await db.insert(schema.skins).values(rows).onConflictDoUpdate({
      target: schema.skins.id,
      set: {
        name: drizzleSql`excluded.name`,
        slug: drizzleSql`excluded.slug`,
        shortSlug: drizzleSql`excluded.short_slug`,
        shortName: drizzleSql`excluded.short_name`,
        weaponId: drizzleSql`excluded.weapon_id`,
        weaponName: drizzleSql`excluded.weapon_name`,
        weaponSlug: drizzleSql`excluded.weapon_slug`,
        categoryId: drizzleSql`excluded.category_id`,
        categoryName: drizzleSql`excluded.category_name`,
        patternId: drizzleSql`excluded.pattern_id`,
        patternName: drizzleSql`excluded.pattern_name`,
        rarityId: drizzleSql`excluded.rarity_id`,
        teamId: drizzleSql`excluded.team_id`,
        description: drizzleSql`excluded.description`,
        paintIndex: drizzleSql`excluded.paint_index`,
        minFloat: drizzleSql`excluded.min_float`,
        maxFloat: drizzleSql`excluded.max_float`,
        stattrak: drizzleSql`excluded.stattrak`,
        souvenir: drizzleSql`excluded.souvenir`,
        marketHashName: drizzleSql`excluded.market_hash_name`,
        image: drizzleSql`excluded.image`,
        legacyModel: drizzleSql`excluded.legacy_model`,
      },
    })
  })
}

async function upsertCrates(all: any[]) {
  await upsertInBatches(all, async (batch) => {
    const rows = batch.map((c) => ({
      id: c.id,
      name: c.name,
      slug: toSlug(c.name),
      shortName: null as string | null,
      type: c.type ?? null,
      description: c.description ?? null,
      firstSaleDate: c.first_sale_date ?? null,
      marketHashName: c.market_hash_name ?? null,
      image: blobUrl('cases', c.original?.image_inventory) ?? c.image ?? null,
    }))
    await db.insert(schema.crates).values(rows).onConflictDoUpdate({
      target: schema.crates.id,
      set: {
        name: drizzleSql`excluded.name`,
        slug: drizzleSql`excluded.slug`,
        type: drizzleSql`excluded.type`,
        description: drizzleSql`excluded.description`,
        firstSaleDate: drizzleSql`excluded.first_sale_date`,
        marketHashName: drizzleSql`excluded.market_hash_name`,
        image: drizzleSql`excluded.image`,
      },
    })
  })
}

async function upsertCollections(all: any[]) {
  await upsertInBatches(all, async (batch) => {
    const rows = batch.map((c) => ({
      id: c.id,
      name: c.name,
      slug: toSlug(c.name),
      // Collections have no image in JSON — preserve existing Blob URL if set
      image: null as string | null,
    }))
    await db.insert(schema.collections).values(rows).onConflictDoUpdate({
      target: schema.collections.id,
      set: {
        name: drizzleSql`excluded.name`,
        slug: drizzleSql`excluded.slug`,
        // Do NOT overwrite image — keep the existing Blob-hosted collection image
      },
    })
  })
}

async function upsertAgents(all: any[]) {
  await upsertInBatches(all, async (batch) => {
    const rows = batch.map((a) => {
      const parts = a.name.split(' | ')
      const shortName = parts.length >= 2 ? parts[0] : null
      const subName = parts.length >= 2 ? parts.slice(1).join(' | ') : null
      return {
        id: a.id,
        name: a.name,
        slug: toSlug(a.name),
        shortName,
        subName,
        rarityId: a.rarity.id,
        teamId: a.team?.id ?? null,
        description: a.description ?? null,
        marketHashName: a.market_hash_name ?? null,
        image: blobUrl('agents', a.original?.image_inventory) ?? a.image ?? null,
        defIndex: a.def_index ? String(a.def_index) : null,
        modelPlayer: a.model_player ?? null,
      }
    })
    await db.insert(schema.agents).values(rows).onConflictDoUpdate({
      target: schema.agents.id,
      set: {
        name: drizzleSql`excluded.name`,
        slug: drizzleSql`excluded.slug`,
        shortName: drizzleSql`excluded.short_name`,
        subName: drizzleSql`excluded.sub_name`,
        rarityId: drizzleSql`excluded.rarity_id`,
        teamId: drizzleSql`excluded.team_id`,
        description: drizzleSql`excluded.description`,
        marketHashName: drizzleSql`excluded.market_hash_name`,
        image: drizzleSql`excluded.image`,
        defIndex: drizzleSql`excluded.def_index`,
        modelPlayer: drizzleSql`excluded.model_player`,
      },
    })
  })
}

async function upsertPatches(all: any[]) {
  await upsertInBatches(all, async (batch) => {
    const rows = batch.map((p) => ({
      id: p.id,
      name: p.name,
      slug: toSlug(p.name),
      shortName: null as string | null,
      rarityId: p.rarity?.id ?? null,
      description: p.description ?? null,
      marketHashName: p.market_hash_name ?? null,
      image: blobUrl('patches', p.original?.image_inventory) ?? p.image ?? null,
      defIndex: p.def_index ? String(p.def_index) : null,
    }))
    await db.insert(schema.patches).values(rows).onConflictDoUpdate({
      target: schema.patches.id,
      set: {
        name: drizzleSql`excluded.name`,
        slug: drizzleSql`excluded.slug`,
        rarityId: drizzleSql`excluded.rarity_id`,
        description: drizzleSql`excluded.description`,
        marketHashName: drizzleSql`excluded.market_hash_name`,
        image: drizzleSql`excluded.image`,
        defIndex: drizzleSql`excluded.def_index`,
      },
    })
  })
}

async function upsertCollectables(all: any[]) {
  await upsertInBatches(all, async (batch) => {
    const rows = batch.map((c) => ({
      id: c.id,
      name: c.name,
      slug: toSlug(c.name),
      shortName: null as string | null,
      rarityId: c.rarity?.id ?? null,
      description: c.description ?? null,
      type: c.type ?? null,
      genuine: c.genuine ?? false,
      marketHashName: c.market_hash_name ?? null,
      image: blobUrl('collectibles', c.original?.image_inventory) ?? c.image ?? null,
      defIndex: c.def_index ? String(c.def_index) : null,
    }))
    await db.insert(schema.collectables).values(rows).onConflictDoUpdate({
      target: schema.collectables.id,
      set: {
        name: drizzleSql`excluded.name`,
        slug: drizzleSql`excluded.slug`,
        rarityId: drizzleSql`excluded.rarity_id`,
        description: drizzleSql`excluded.description`,
        type: drizzleSql`excluded.type`,
        genuine: drizzleSql`excluded.genuine`,
        marketHashName: drizzleSql`excluded.market_hash_name`,
        image: drizzleSql`excluded.image`,
        defIndex: drizzleSql`excluded.def_index`,
      },
    })
  })
}

async function upsertKeychains(all: any[]) {
  await upsertInBatches(all, async (batch) => {
    const rows = batch.map((k) => ({
      id: k.id,
      name: k.name,
      slug: toSlug(k.name),
      rarityId: k.rarity?.id ?? null,
      description: k.description ?? null,
      marketHashName: k.market_hash_name ?? null,
      image: blobUrl('keychains', k.original?.image_inventory) ?? k.image ?? null,
      defIndex: k.def_index ? String(k.def_index) : null,
    }))
    await db.insert(schema.keychains).values(rows).onConflictDoUpdate({
      target: schema.keychains.id,
      set: {
        name: drizzleSql`excluded.name`,
        slug: drizzleSql`excluded.slug`,
        rarityId: drizzleSql`excluded.rarity_id`,
        description: drizzleSql`excluded.description`,
        marketHashName: drizzleSql`excluded.market_hash_name`,
        image: drizzleSql`excluded.image`,
        defIndex: drizzleSql`excluded.def_index`,
      },
    })
  })
}

async function upsertTournaments(map: Map<string, string>) {
  const rows = [...map.entries()].map(([id, name]) => ({ id, name }))
  if (rows.length === 0) return
  await db.insert(schema.tournaments).values(rows).onConflictDoUpdate({
    target: schema.tournaments.id,
    set: { name: drizzleSql`excluded.name` },
  })
}

async function upsertStickers(all: any[]) {
  await upsertInBatches(all, async (batch) => {
    const rows = batch.map((s) => ({
      id: s.id,
      name: s.name,
      slug: toSlug(s.name),
      rarityId: s.rarity?.id ?? null,
      description: s.description ?? null,
      type: s.type ?? null,
      effect: s.effect ?? null,
      tournamentId: s.tournament ? `tournament-${s.tournament.id}` : null,
      marketHashName: s.market_hash_name ?? null,
      image: blobUrl('stickers', s.original?.image_inventory) ?? s.image ?? null,
      defIndex: s.def_index ? String(s.def_index) : null,
    }))
    await db.insert(schema.stickers).values(rows).onConflictDoUpdate({
      target: schema.stickers.id,
      set: {
        name: drizzleSql`excluded.name`,
        slug: drizzleSql`excluded.slug`,
        rarityId: drizzleSql`excluded.rarity_id`,
        description: drizzleSql`excluded.description`,
        type: drizzleSql`excluded.type`,
        effect: drizzleSql`excluded.effect`,
        tournamentId: drizzleSql`excluded.tournament_id`,
        marketHashName: drizzleSql`excluded.market_hash_name`,
        image: drizzleSql`excluded.image`,
        defIndex: drizzleSql`excluded.def_index`,
      },
    })
  })
}

async function upsertGraffiti(all: any[]) {
  await upsertInBatches(all, async (batch) => {
    const rows = batch.map((g) => ({
      id: g.id,
      name: g.name,
      slug: toSlug(g.name),
      rarityId: g.rarity?.id ?? null,
      description: g.description ?? null,
      marketHashName: g.market_hash_name ?? null,
      image: blobUrl('graffiti', g.original?.image_inventory) ?? g.image ?? null,
      defIndex: g.def_index ? String(g.def_index) : null,
    }))
    await db.insert(schema.graffiti).values(rows).onConflictDoUpdate({
      target: schema.graffiti.id,
      set: {
        name: drizzleSql`excluded.name`,
        slug: drizzleSql`excluded.slug`,
        rarityId: drizzleSql`excluded.rarity_id`,
        description: drizzleSql`excluded.description`,
        marketHashName: drizzleSql`excluded.market_hash_name`,
        image: drizzleSql`excluded.image`,
        defIndex: drizzleSql`excluded.def_index`,
      },
    })
  })
}

async function upsertMusicKits(all: any[]) {
  await upsertInBatches(all, async (batch) => {
    const rows = batch.map((m) => ({
      id: m.id,
      name: m.name,
      slug: toSlug(m.name),
      rarityId: m.rarity?.id ?? null,
      description: m.description ?? null,
      exclusive: m.exclusive ?? false,
      marketHashName: m.market_hash_name ?? null,
      image: blobUrl('music_kits', m.original?.image_inventory) ?? m.image ?? null,
      defIndex: m.def_index ? String(m.def_index) : null,
    }))
    await db.insert(schema.musicKits).values(rows).onConflictDoUpdate({
      target: schema.musicKits.id,
      set: {
        name: drizzleSql`excluded.name`,
        slug: drizzleSql`excluded.slug`,
        rarityId: drizzleSql`excluded.rarity_id`,
        description: drizzleSql`excluded.description`,
        exclusive: drizzleSql`excluded.exclusive`,
        marketHashName: drizzleSql`excluded.market_hash_name`,
        image: drizzleSql`excluded.image`,
        defIndex: drizzleSql`excluded.def_index`,
      },
    })
  })
}

async function upsertKeys(all: any[]) {
  await upsertInBatches(all, async (batch) => {
    const rows = batch.map((k) => ({
      id: k.id,
      name: k.name,
      slug: toSlug(k.name),
      description: k.description ?? null,
      marketable: k.marketable ?? false,
      marketHashName: k.market_hash_name ?? null,
      image: blobUrl('keys', k.original?.image_inventory) ?? k.image ?? null,
      defIndex: k.def_index ? String(k.def_index) : null,
    }))
    await db.insert(schema.keys).values(rows).onConflictDoUpdate({
      target: schema.keys.id,
      set: {
        name: drizzleSql`excluded.name`,
        slug: drizzleSql`excluded.slug`,
        description: drizzleSql`excluded.description`,
        marketable: drizzleSql`excluded.marketable`,
        marketHashName: drizzleSql`excluded.market_hash_name`,
        image: drizzleSql`excluded.image`,
        defIndex: drizzleSql`excluded.def_index`,
      },
    })
  })
}

async function upsertWeapons(all: any[]) {
  // Maps weapons_table.json (weapon_id as string PK) into the weapons table
  await upsertInBatches(all, async (batch) => {
    const rows = batch.map((w) => ({
      id: w.weapon_id, // e.g. "weapon_ak47" becomes the PK
      name: w.name,
      slug: w.slug,
      type: w.type ?? null,
      image: w.image ?? null,
      description: null as string | null,
      price: w.price ?? null,
      killReward: w.kill_reward ?? null,
      rawDamage: w.raw_damage ?? null,
      armorPen: w.armor_pen ?? null,
      fireRate: w.fire_rate ?? null,
      recoil: w.recoil ?? null,
      magSize: w.mag_size ?? null,
      ammoReserve: w.ammo_reserve ?? null,
      reloadTime: w.reload_time ?? null,
      movementSpeed: w.movement_speed ?? null,
      fullAuto: w.full_auto ?? null,
      crouchInacc: w.crouch_inacc ?? null,
      standInacc: w.stand_inacc ?? null,
      runInacc: w.run_inacc ?? null,
      fireInacc: w.fire_inacc ?? null,
      recoverTimeStand: w.recover_time_stand ?? null,
      recoverTimeCrouch: w.recover_time_crouch ?? null,
      ttkShort: w.ttk_short ?? null,
      ttkLong: w.ttk_long ?? null,
      btkChestShort: w.btk_chest_short ?? null,
      bttkChestLong: w.bttk_chest_long ?? null,
      damShortNoArmor: w.dam_short_no_armor ?? null,
      damLongNoArmor: w.dam_long_no_armor ?? null,
      damShortArmor: w.dam_short_armor ?? null,
      damLongArmor: w.dam_long_armor ?? null,
    }))
    await db.insert(schema.weapons).values(rows).onConflictDoUpdate({
      target: schema.weapons.id,
      set: {
        name: drizzleSql`excluded.name`,
        slug: drizzleSql`excluded.slug`,
        type: drizzleSql`excluded.type`,
        price: drizzleSql`excluded.price`,
        killReward: drizzleSql`excluded.kill_reward`,
        rawDamage: drizzleSql`excluded.raw_damage`,
        armorPen: drizzleSql`excluded.armor_pen`,
        fireRate: drizzleSql`excluded.fire_rate`,
        recoil: drizzleSql`excluded.recoil`,
        magSize: drizzleSql`excluded.mag_size`,
        ammoReserve: drizzleSql`excluded.ammo_reserve`,
        reloadTime: drizzleSql`excluded.reload_time`,
        movementSpeed: drizzleSql`excluded.movement_speed`,
        fullAuto: drizzleSql`excluded.full_auto`,
        crouchInacc: drizzleSql`excluded.crouch_inacc`,
        standInacc: drizzleSql`excluded.stand_inacc`,
        runInacc: drizzleSql`excluded.run_inacc`,
        fireInacc: drizzleSql`excluded.fire_inacc`,
        recoverTimeStand: drizzleSql`excluded.recover_time_stand`,
        recoverTimeCrouch: drizzleSql`excluded.recover_time_crouch`,
        ttkShort: drizzleSql`excluded.ttk_short`,
        ttkLong: drizzleSql`excluded.ttk_long`,
        btkChestShort: drizzleSql`excluded.btk_chest_short`,
        bttkChestLong: drizzleSql`excluded.bttk_chest_long`,
        damShortNoArmor: drizzleSql`excluded.dam_short_no_armor`,
        damLongNoArmor: drizzleSql`excluded.dam_long_no_armor`,
        damShortArmor: drizzleSql`excluded.dam_short_armor`,
        damLongArmor: drizzleSql`excluded.dam_long_armor`,
      },
    })
  })
}

// ─── Join table population ────────────────────────────────────────────────────

async function populateJoinTables() {
  // skin_crates + skin_collections from skins.json
  const skins = readJson<any>('skins.json')
  for (const skin of skins) {
    if (skin.crates?.length) {
      const rows = skin.crates.map((c: any) => ({ skinId: skin.id, crateId: c.id, isRare: false }))
      await db.insert(schema.skinCrates).values(rows).onConflictDoNothing()
    }
    if (skin.collections?.length) {
      const rows = skin.collections.map((c: any) => ({ skinId: skin.id, collectionId: c.id }))
      await db.insert(schema.skinCollections).values(rows).onConflictDoNothing()
    }
  }
  console.log('  ✓ skin_crates, skin_collections')

  // agent_collections from agents.json
  const agents = readJson<any>('agents.json')
  for (const agent of agents) {
    if (agent.collections?.length) {
      const rows = agent.collections.map((c: any) => ({ agentId: agent.id, collectionId: c.id }))
      await db.insert(schema.agentCollections).values(rows).onConflictDoNothing()
    }
  }
  console.log('  ✓ agent_collections')

  // keychain_collections from keychains.json
  const keychains = readJson<any>('keychains.json')
  for (const k of keychains) {
    if (k.collections?.length) {
      const rows = k.collections.map((c: any) => ({ keychainId: k.id, collectionId: c.id }))
      await db.insert(schema.keychainCollections).values(rows).onConflictDoNothing()
    }
  }
  console.log('  ✓ keychain_collections')

  // sticker_crates + sticker_collections from stickers.json
  const stickers = readJson<any>('stickers.json')
  for (const s of stickers) {
    if (s.crates?.length) {
      const rows = s.crates.map((c: any) => ({ stickerId: s.id, crateId: c.id }))
      await db.insert(schema.stickerCrates).values(rows).onConflictDoNothing()
    }
    if (s.collections?.length) {
      const rows = s.collections.map((c: any) => ({ stickerId: s.id, collectionId: c.id }))
      await db.insert(schema.stickerCollections).values(rows).onConflictDoNothing()
    }
  }
  console.log('  ✓ sticker_crates, sticker_collections')

  // graffiti_crates from graffiti.json
  const graffiti = readJson<any>('graffiti.json')
  for (const g of graffiti) {
    if (g.crates?.length) {
      const rows = g.crates.map((c: any) => ({ graffitiId: g.id, crateId: c.id }))
      await db.insert(schema.graffitiCrates).values(rows).onConflictDoNothing()
    }
  }
  console.log('  ✓ graffiti_crates')

  // key_crates from keys.json
  const keys = readJson<any>('keys.json')
  for (const k of keys) {
    if (k.crates?.length) {
      const rows = k.crates.map((c: any) => ({ keyId: k.id, crateId: c.id }))
      await db.insert(schema.keyCrates).values(rows).onConflictDoNothing()
    }
  }
  console.log('  ✓ key_crates')

  // collection_crates from collections.json
  const collections = readJson<any>('collections.json')
  for (const col of collections) {
    if (col.crates?.length) {
      const rows = col.crates.map((c: any) => ({ collectionId: col.id, crateId: c.id }))
      await db.insert(schema.collectionCrates).values(rows).onConflictDoNothing()
    }
  }
  console.log('  ✓ collection_crates')
}

// ─── Run ──────────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
