'use server'

import { db } from '@/db'
import * as schema from '@/db/schema'
import { ilike, eq, and, not, or, inArray } from 'drizzle-orm'

export interface SearchResult {
  id: string
  name: string
  href: string
  image: string | null
  category: string
  rarityColor?: string | null
  sub?: string | null  // weapon name for skins, subName for agents
}

const LIMIT = 5

export async function searchItems(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []
  const q = `%${trimmed}%`

  const [
    skins,
    gloves,
    cases,
    souvenirs,
    collections,
    weapons,
    agents,
    patches,
    pins,
    keychains,
    stickers,
    graffiti,
    musicKits,
  ] = await Promise.all([
    // Weapon skins (non-gloves, non-knife — knives show under their own weapon entry)
    db
      .select({
        id: schema.skins.id,
        name: schema.skins.name,
        shortName: schema.skins.shortName,
        shortSlug: schema.skins.shortSlug,
        weaponSlug: schema.skins.weaponSlug,
        weaponName: schema.skins.weaponName,
        image: schema.skins.image,
        rarityColor: schema.rarities.color,
      })
      .from(schema.skins)
      .leftJoin(schema.rarities, eq(schema.skins.rarityId, schema.rarities.id))
      .where(and(ilike(schema.skins.name, q), not(eq(schema.skins.categoryName, 'Gloves'))))
      .limit(LIMIT),

    // Gloves
    db
      .select({
        id: schema.skins.id,
        name: schema.skins.name,
        shortName: schema.skins.shortName,
        shortSlug: schema.skins.shortSlug,
        weaponSlug: schema.skins.weaponSlug,
        weaponName: schema.skins.weaponName,
        image: schema.skins.image,
        rarityColor: schema.rarities.color,
      })
      .from(schema.skins)
      .leftJoin(schema.rarities, eq(schema.skins.rarityId, schema.rarities.id))
      .where(and(ilike(schema.skins.name, q), eq(schema.skins.categoryName, 'Gloves')))
      .limit(LIMIT),

    // Cases
    db
      .select({ id: schema.crates.id, name: schema.crates.name, slug: schema.crates.slug, image: schema.crates.image })
      .from(schema.crates)
      .where(and(ilike(schema.crates.name, q), eq(schema.crates.type, 'Case')))
      .limit(LIMIT),

    // Souvenir Packages
    db
      .select({ id: schema.crates.id, name: schema.crates.name, slug: schema.crates.slug, image: schema.crates.image })
      .from(schema.crates)
      .where(and(ilike(schema.crates.name, q), inArray(schema.crates.type, ['Souvenir', 'Souvenir Highlight'])))
      .limit(LIMIT),

    // Collections
    db
      .select({ id: schema.collections.id, name: schema.collections.name, slug: schema.collections.slug, image: schema.collections.image })
      .from(schema.collections)
      .where(ilike(schema.collections.name, q))
      .limit(LIMIT),

    // Weapon types (e.g. AK-47, AWP)
    db
      .select({ id: schema.weapons.id, name: schema.weapons.name, slug: schema.weapons.slug, image: schema.weapons.image })
      .from(schema.weapons)
      .where(ilike(schema.weapons.name, q))
      .limit(LIMIT),

    // Agents
    db
      .select({
        id: schema.agents.id,
        name: schema.agents.name,
        shortName: schema.agents.shortName,
        subName: schema.agents.subName,
        slug: schema.agents.slug,
        image: schema.agents.image,
        rarityColor: schema.rarities.color,
      })
      .from(schema.agents)
      .leftJoin(schema.rarities, eq(schema.agents.rarityId, schema.rarities.id))
      .where(or(ilike(schema.agents.name, q), ilike(schema.agents.shortName, q)))
      .limit(LIMIT),

    // Patches
    db
      .select({
        id: schema.patches.id,
        name: schema.patches.name,
        shortName: schema.patches.shortName,
        slug: schema.patches.slug,
        image: schema.patches.image,
        rarityColor: schema.rarities.color,
      })
      .from(schema.patches)
      .leftJoin(schema.rarities, eq(schema.patches.rarityId, schema.rarities.id))
      .where(or(ilike(schema.patches.name, q), ilike(schema.patches.shortName, q)))
      .limit(LIMIT),

    // Pins
    db
      .select({
        id: schema.collectables.id,
        name: schema.collectables.name,
        shortName: schema.collectables.shortName,
        slug: schema.collectables.slug,
        image: schema.collectables.image,
        rarityColor: schema.rarities.color,
      })
      .from(schema.collectables)
      .leftJoin(schema.rarities, eq(schema.collectables.rarityId, schema.rarities.id))
      .where(and(
        eq(schema.collectables.type, 'Pin'),
        or(ilike(schema.collectables.name, q), ilike(schema.collectables.shortName, q))
      ))
      .limit(LIMIT),

    // Keychains
    db
      .select({
        id: schema.keychains.id,
        name: schema.keychains.name,
        slug: schema.keychains.slug,
        image: schema.keychains.image,
        rarityColor: schema.rarities.color,
      })
      .from(schema.keychains)
      .leftJoin(schema.rarities, eq(schema.keychains.rarityId, schema.rarities.id))
      .where(ilike(schema.keychains.name, q))
      .limit(LIMIT),

    // Stickers
    db
      .select({
        id: schema.stickers.id,
        name: schema.stickers.name,
        slug: schema.stickers.slug,
        image: schema.stickers.image,
        rarityColor: schema.rarities.color,
      })
      .from(schema.stickers)
      .leftJoin(schema.rarities, eq(schema.stickers.rarityId, schema.rarities.id))
      .where(ilike(schema.stickers.name, q))
      .limit(LIMIT),

    // Graffiti
    db
      .select({
        id: schema.graffiti.id,
        name: schema.graffiti.name,
        slug: schema.graffiti.slug,
        image: schema.graffiti.image,
        rarityColor: schema.rarities.color,
      })
      .from(schema.graffiti)
      .leftJoin(schema.rarities, eq(schema.graffiti.rarityId, schema.rarities.id))
      .where(ilike(schema.graffiti.name, q))
      .limit(LIMIT),

    // Music Kits
    db
      .select({
        id: schema.musicKits.id,
        name: schema.musicKits.name,
        slug: schema.musicKits.slug,
        image: schema.musicKits.image,
        rarityColor: schema.rarities.color,
      })
      .from(schema.musicKits)
      .leftJoin(schema.rarities, eq(schema.musicKits.rarityId, schema.rarities.id))
      .where(ilike(schema.musicKits.name, q))
      .limit(LIMIT),
  ])

  return [
    ...skins.map((s) => ({
      id: s.id,
      name: s.shortName ?? s.name,
      href: `/weapons/${s.weaponSlug}/${s.shortSlug}`,
      image: s.image,
      category: 'Skins',
      rarityColor: s.rarityColor,
      sub: s.weaponName ?? undefined,
    })),
    ...gloves.map((s) => ({
      id: s.id,
      name: s.shortName ?? s.name,
      href: `/gloves/${s.shortSlug}`,
      image: s.image,
      category: 'Gloves',
      rarityColor: s.rarityColor,
      sub: s.weaponName ?? undefined,
    })),
    ...cases.map((c) => ({
      id: c.id,
      name: c.name,
      href: `/cases/${c.slug}`,
      image: c.image,
      category: 'Cases',
    })),
    ...souvenirs.map((c) => ({
      id: c.id,
      name: c.name,
      href: `/souvenir-packages/${c.slug}`,
      image: c.image,
      category: 'Souvenir Packages',
    })),
    ...collections.map((c) => ({
      id: c.id,
      name: c.name,
      href: `/collections/${c.slug}`,
      image: c.image,
      category: 'Collections',
    })),
    ...weapons.map((w) => ({
      id: w.id,
      name: w.name,
      href: `/weapons/${w.slug}`,
      image: w.image,
      category: 'Weapons',
    })),
    ...agents.map((a) => ({
      id: a.id,
      name: a.shortName ?? a.name,
      href: `/agents/${a.slug}`,
      image: a.image,
      category: 'Agents',
      rarityColor: a.rarityColor,
      sub: a.subName ?? undefined,
    })),
    ...patches.map((p) => ({
      id: p.id,
      name: p.shortName ?? p.name,
      href: `/patches/${p.slug}`,
      image: p.image,
      category: 'Patches',
      rarityColor: p.rarityColor,
    })),
    ...pins.map((p) => ({
      id: p.id,
      name: p.shortName ?? p.name,
      href: `/pins/${p.slug}`,
      image: p.image,
      category: 'Pins',
      rarityColor: p.rarityColor,
    })),
    ...keychains.map((k) => ({
      id: k.id,
      name: k.name,
      href: `/keychains/${k.slug}`,
      image: k.image,
      category: 'Keychains',
      rarityColor: k.rarityColor,
    })),
    ...stickers.map((s) => ({
      id: s.id,
      name: s.name,
      href: `/stickers/${s.slug}`,
      image: s.image,
      category: 'Stickers',
      rarityColor: s.rarityColor,
    })),
    ...graffiti.map((g) => ({
      id: g.id,
      name: g.name,
      href: `/graffiti/${g.slug}`,
      image: g.image,
      category: 'Graffiti',
      rarityColor: g.rarityColor,
    })),
    ...musicKits.map((m) => ({
      id: m.id,
      name: m.name,
      href: `/music-kits/${m.slug}`,
      image: m.image,
      category: 'Music Kits',
      rarityColor: m.rarityColor,
    })),
  ]
}
