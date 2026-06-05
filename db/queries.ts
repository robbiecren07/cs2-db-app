import { db } from './index'
import { skins, rarities, collections, skinCollections, skinCrates, crates, agentCollections } from './schema'
import { eq, inArray } from 'drizzle-orm'
import type { CaseRef } from '@/types/custom'

export const skinSelect = {
  id: skins.id,
  name: skins.name,
  slug: skins.slug,
  shortSlug: skins.shortSlug,
  shortName: skins.shortName,
  weaponId: skins.weaponId,
  weaponName: skins.weaponName,
  weaponSlug: skins.weaponSlug,
  categoryId: skins.categoryId,
  categoryName: skins.categoryName,
  rarityId: skins.rarityId,
  patternId: skins.patternId,
  patternName: skins.patternName,
  paintIndex: skins.paintIndex,
  minFloat: skins.minFloat,
  maxFloat: skins.maxFloat,
  stattrak: skins.stattrak,
  souvenir: skins.souvenir,
  featured: skins.featured,
  teamId: skins.teamId,
  description: skins.description,
  marketHashName: skins.marketHashName,
  legacyModel: skins.legacyModel,
  image: skins.image,
  rarityName: rarities.name,
  rarityColor: rarities.color,
}

export async function getCollectionsForSkins(
  skinIds: string[]
): Promise<Map<string, { collectionName: string | null; collectionSlug: string | null }>> {
  if (!skinIds.length) return new Map()
  const rows = await db
    .select({ skinId: skinCollections.skinId, collectionName: collections.name, collectionSlug: collections.slug })
    .from(skinCollections)
    .leftJoin(collections, eq(skinCollections.collectionId, collections.id))
    .where(inArray(skinCollections.skinId, skinIds))
  const map = new Map<string, { collectionName: string | null; collectionSlug: string | null }>()
  for (const row of rows) {
    if (!map.has(row.skinId)) {
      map.set(row.skinId, { collectionName: row.collectionName, collectionSlug: row.collectionSlug })
    }
  }
  return map
}

export async function getCasesForSkin(skinId: string): Promise<CaseRef[]> {
  return db
    .select({ id: crates.id, name: crates.name, slug: crates.slug, image: crates.image })
    .from(skinCrates)
    .innerJoin(crates, eq(skinCrates.crateId, crates.id))
    .where(eq(skinCrates.skinId, skinId))
}

export async function getCollectionForAgent(
  agentId: string
): Promise<{ collectionId: string; collectionName: string | null; collectionSlug: string | null } | null> {
  const rows = await db
    .select({ collectionId: agentCollections.collectionId, collectionName: collections.name, collectionSlug: collections.slug })
    .from(agentCollections)
    .leftJoin(collections, eq(agentCollections.collectionId, collections.id))
    .where(eq(agentCollections.agentId, agentId))
    .limit(1)
  return rows[0] ?? null
}

export async function getCollectionsForAgents(
  agentIds: string[]
): Promise<Map<string, { collectionName: string | null; collectionSlug: string | null }>> {
  if (!agentIds.length) return new Map()
  const rows = await db
    .select({ agentId: agentCollections.agentId, collectionName: collections.name, collectionSlug: collections.slug })
    .from(agentCollections)
    .leftJoin(collections, eq(agentCollections.collectionId, collections.id))
    .where(inArray(agentCollections.agentId, agentIds))
  const map = new Map<string, { collectionName: string | null; collectionSlug: string | null }>()
  for (const row of rows) {
    if (!map.has(row.agentId)) {
      map.set(row.agentId, { collectionName: row.collectionName, collectionSlug: row.collectionSlug })
    }
  }
  return map
}
