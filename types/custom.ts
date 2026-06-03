import type { InferSelectModel } from 'drizzle-orm'
import type * as schema from '@/db/schema'

// ─── Base table types from Drizzle schema (camelCase) ───────────────────────

export type Skin = InferSelectModel<typeof schema.skins>
export type Crate = InferSelectModel<typeof schema.crates>
export type Collection = InferSelectModel<typeof schema.collections>
export type Weapon = InferSelectModel<typeof schema.weapons>
export type Agent = InferSelectModel<typeof schema.agents>
export type Patch = InferSelectModel<typeof schema.patches>
export type Collectable = InferSelectModel<typeof schema.collectables>
export type Keychain = InferSelectModel<typeof schema.keychains>
export type Sticker = InferSelectModel<typeof schema.stickers>
export type Graffiti = InferSelectModel<typeof schema.graffiti>
export type MusicKit = InferSelectModel<typeof schema.musicKits>
export type Rarity = InferSelectModel<typeof schema.rarities>

// ─── CaseRef ────────────────────────────────────────────────────────────────
// Replaces the old JSON-blob `in_cases` field. Populated via skin_crates join.

export interface CaseRef {
  id: string
  name: string
  slug: string
  image: string | null
}

export type Case = CaseRef

// ─── Extended types with joined rarity + collection fields ───────────────────

export type SkinWithDetails = Skin & {
  rarityName: string | null
  rarityColor: string | null
  collectionName: string | null
  collectionSlug: string | null
  inCases?: CaseRef[]
}

export type AgentWithDetails = Agent & {
  rarityName: string | null
  rarityColor: string | null
  collectionName: string | null
  collectionSlug: string | null
}

export type PatchWithRarity = Patch & {
  rarityName: string | null
  rarityColor: string | null
}

export type CollectableWithRarity = Collectable & {
  rarityName: string | null
  rarityColor: string | null
}

export type KeychainWithRarity = Keychain & {
  rarityName: string | null
  rarityColor: string | null
}

export type StickerWithRarity = Sticker & {
  rarityName: string | null
  rarityColor: string | null
}

export type GraffitiWithRarity = Graffiti & {
  rarityName: string | null
  rarityColor: string | null
}

export type MusicKitWithRarity = MusicKit & {
  rarityName: string | null
  rarityColor: string | null
}

// ─── Semantic aliases ────────────────────────────────────────────────────────

// Gloves are skins filtered by categoryName = 'Gloves'
export type Glove = SkinWithDetails

// Souvenir packages are crates filtered by type IN ('Souvenir', 'Souvenir Highlight')
export type SouvenirPackage = Crate

// ─── Rarity IDs ─────────────────────────────────────────────────────────────

export type RarityId =
  | 'rarity_ancient'
  | 'rarity_ancient_character'
  | 'rarity_ancient_weapon'
  | 'rarity_common'
  | 'rarity_common_highlight'
  | 'rarity_common_weapon'
  | 'rarity_contraband'
  | 'rarity_contraband_weapon'
  | 'rarity_default'
  | 'rarity_legendary'
  | 'rarity_legendary_character'
  | 'rarity_legendary_weapon'
  | 'rarity_mythical'
  | 'rarity_mythical_character'
  | 'rarity_mythical_weapon'
  | 'rarity_rare'
  | 'rarity_rare_character'
  | 'rarity_rare_weapon'
  | 'rarity_uncommon_weapon'
