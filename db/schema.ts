import { pgTable, text, boolean, real, integer, primaryKey, index } from 'drizzle-orm/pg-core'

// ─── Reference / lookup tables ───────────────────────────────────────────────

export const rarities = pgTable('rarities', {
  id: text('id').primaryKey(), // e.g. "rarity_legendary_weapon"
  name: text('name').notNull(), // e.g. "Classified"
  color: text('color').notNull(), // hex, e.g. "#d32ce6"
  slug: text('slug').notNull(),
  order: integer('order').notNull().default(0),
})

export const weapons = pgTable('weapons', {
  id: text('id').primaryKey(), // weapon_id string, e.g. "weapon_ak47"
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  type: text('type'), // "rifles", "pistols", "smgs", "heavy", "knives"
  image: text('image'),
  description: text('description'),
  // Ballistic stats stored as formatted strings (e.g. "800.00 RPM", "71.00%")
  price: text('price'),
  killReward: text('kill_reward'),
  rawDamage: text('raw_damage'),
  armorPen: text('armor_pen'),
  fireRate: text('fire_rate'),
  recoil: text('recoil'),
  magSize: text('mag_size'),
  ammoReserve: text('ammo_reserve'),
  reloadTime: text('reload_time'),
  movementSpeed: text('movement_speed'),
  fullAuto: text('full_auto'),
  crouchInacc: text('crouch_inacc'),
  standInacc: text('stand_inacc'),
  runInacc: text('run_inacc'),
  fireInacc: text('fire_inacc'),
  recoverTimeStand: text('recover_time_stand'),
  recoverTimeCrouch: text('recover_time_crouch'),
  ttkShort: text('ttk_short'),
  ttkLong: text('ttk_long'),
  btkChestShort: text('btk_chest_short'),
  bttkChestLong: text('bttk_chest_long'),
  damShortNoArmor: text('dam_short_no_armor'),
  damLongNoArmor: text('dam_long_no_armor'),
  damShortArmor: text('dam_short_armor'),
  damLongArmor: text('dam_long_armor'),
})

export const collections = pgTable('collections', {
  id: text('id').primaryKey(), // e.g. "collection-set-community-37"
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  image: text('image'),
  featured: boolean('featured').notNull().default(false),
}, (t) => [
  index('collections_slug_idx').on(t.slug),
])

export const tournaments = pgTable('tournaments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
})

// ─── Main item tables ─────────────────────────────────────────────────────────

export const skins = pgTable('skins', {
  id: text('id').primaryKey(), // e.g. "skin-f64cdaac0b90"
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  shortSlug: text('short_slug').notNull(),
  shortName: text('short_name'),
  weaponId: text('weapon_id'), // soft ref to weapons.id; gloves use IDs not in weapons table
  weaponName: text('weapon_name'), // denormalized for display and URL construction
  weaponSlug: text('weapon_slug'), // denormalized for URL segment
  categoryId: text('category_id').notNull(), // game category id
  categoryName: text('category_name'),
  patternId: text('pattern_id'),
  patternName: text('pattern_name'),
  rarityId: text('rarity_id').references(() => rarities.id),
  teamId: text('team_id'),
  description: text('description'),
  paintIndex: text('paint_index'),
  minFloat: real('min_float'),
  maxFloat: real('max_float'),
  stattrak: boolean('stattrak').notNull().default(false),
  souvenir: boolean('souvenir').notNull().default(false),
  marketHashName: text('market_hash_name'),
  image: text('image'),
  featured: boolean('featured').notNull().default(false),
  legacyModel: boolean('legacy_model').notNull().default(false),
}, (t) => [
  index('skins_slug_idx').on(t.slug),
  index('skins_weapon_slug_short_slug_idx').on(t.weaponSlug, t.shortSlug), // skin detail URL lookup
  index('skins_weapon_id_idx').on(t.weaponId),                             // weapon page listing
  index('skins_category_name_idx').on(t.categoryName),                     // gloves filter
  index('skins_rarity_id_idx').on(t.rarityId),                             // rarity filter
])

export const crates = pgTable('crates', {
  id: text('id').primaryKey(), // e.g. "crate-1210"
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  shortName: text('short_name'),
  type: text('type'), // null, "souvenir_package", "capsule", etc.
  description: text('description'),
  firstSaleDate: text('first_sale_date'), // "YYYY/MM/DD"
  marketHashName: text('market_hash_name'),
  image: text('image'),
}, (t) => [
  index('crates_slug_idx').on(t.slug),
  index('crates_type_idx').on(t.type),
])

export const agents = pgTable('agents', {
  id: text('id').primaryKey(), // e.g. "agent-4613"
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  shortName: text('short_name'),
  subName: text('sub_name'),
  rarityId: text('rarity_id').references(() => rarities.id),
  teamId: text('team_id'),
  description: text('description'),
  marketHashName: text('market_hash_name'),
  image: text('image'),
  defIndex: text('def_index'),
  modelPlayer: text('model_player'),
}, (t) => [
  index('agents_slug_idx').on(t.slug),
])

export const patches = pgTable('patches', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  shortName: text('short_name'),
  rarityId: text('rarity_id').references(() => rarities.id),
  description: text('description'),
  marketHashName: text('market_hash_name'),
  image: text('image'),
  defIndex: text('def_index'),
}, (t) => [
  index('patches_slug_idx').on(t.slug),
])

export const collectables = pgTable('collectables', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  shortName: text('short_name'),
  rarityId: text('rarity_id').references(() => rarities.id),
  description: text('description'),
  type: text('type'),
  genuine: boolean('genuine').notNull().default(false),
  marketHashName: text('market_hash_name'),
  image: text('image'),
  defIndex: text('def_index'),
}, (t) => [
  index('collectables_slug_idx').on(t.slug),
  index('collectables_type_idx').on(t.type),
])

export const keychains = pgTable('keychains', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  rarityId: text('rarity_id').references(() => rarities.id),
  description: text('description'),
  marketHashName: text('market_hash_name'),
  image: text('image'),
  defIndex: text('def_index'),
}, (t) => [
  index('keychains_slug_idx').on(t.slug),
])

export const stickers = pgTable('stickers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  rarityId: text('rarity_id').references(() => rarities.id),
  description: text('description'),
  type: text('type'), // "Event", "Team", "Graffiti", etc.
  effect: text('effect'), // "Other", "Foil", "Holo", etc.
  tournamentId: text('tournament_id').references(() => tournaments.id),
  marketHashName: text('market_hash_name'),
  image: text('image'),
  defIndex: text('def_index'),
}, (t) => [
  index('stickers_slug_idx').on(t.slug),
  index('stickers_type_idx').on(t.type),
])

export const graffiti = pgTable('graffiti', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  rarityId: text('rarity_id').references(() => rarities.id),
  description: text('description'),
  marketHashName: text('market_hash_name'),
  image: text('image'),
  defIndex: text('def_index'),
}, (t) => [
  index('graffiti_slug_idx').on(t.slug),
])

export const musicKits = pgTable('music_kits', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  rarityId: text('rarity_id').references(() => rarities.id),
  description: text('description'),
  exclusive: boolean('exclusive').notNull().default(false),
  marketHashName: text('market_hash_name'),
  image: text('image'),
  defIndex: text('def_index'),
}, (t) => [
  index('music_kits_slug_idx').on(t.slug),
])

export const keys = pgTable('keys', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  marketable: boolean('marketable').notNull().default(false),
  marketHashName: text('market_hash_name'),
  image: text('image'),
  defIndex: text('def_index'),
})

// ─── Join tables ──────────────────────────────────────────────────────────────

export const skinCrates = pgTable(
  'skin_crates',
  {
    skinId: text('skin_id')
      .notNull()
      .references(() => skins.id),
    crateId: text('crate_id')
      .notNull()
      .references(() => crates.id),
    isRare: boolean('is_rare').notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.skinId, t.crateId] }),
    index('skin_crates_crate_id_idx').on(t.crateId), // reverse lookup: skins in a crate
  ],
)

export const skinCollections = pgTable(
  'skin_collections',
  {
    skinId: text('skin_id')
      .notNull()
      .references(() => skins.id),
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id),
  },
  (t) => [
    primaryKey({ columns: [t.skinId, t.collectionId] }),
    index('skin_collections_collection_id_idx').on(t.collectionId), // reverse lookup: skins in a collection
  ],
)

export const agentCollections = pgTable(
  'agent_collections',
  {
    agentId: text('agent_id')
      .notNull()
      .references(() => agents.id),
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id),
  },
  (t) => [
    primaryKey({ columns: [t.agentId, t.collectionId] }),
    index('agent_collections_collection_id_idx').on(t.collectionId),
  ],
)

export const keychainCollections = pgTable(
  'keychain_collections',
  {
    keychainId: text('keychain_id')
      .notNull()
      .references(() => keychains.id),
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id),
  },
  (t) => [primaryKey({ columns: [t.keychainId, t.collectionId] })],
)

export const stickerCrates = pgTable(
  'sticker_crates',
  {
    stickerId: text('sticker_id')
      .notNull()
      .references(() => stickers.id),
    crateId: text('crate_id')
      .notNull()
      .references(() => crates.id),
  },
  (t) => [primaryKey({ columns: [t.stickerId, t.crateId] })],
)

export const stickerCollections = pgTable(
  'sticker_collections',
  {
    stickerId: text('sticker_id')
      .notNull()
      .references(() => stickers.id),
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id),
  },
  (t) => [primaryKey({ columns: [t.stickerId, t.collectionId] })],
)

export const graffitiCrates = pgTable(
  'graffiti_crates',
  {
    graffitiId: text('graffiti_id')
      .notNull()
      .references(() => graffiti.id),
    crateId: text('crate_id')
      .notNull()
      .references(() => crates.id),
  },
  (t) => [primaryKey({ columns: [t.graffitiId, t.crateId] })],
)

export const keyCrates = pgTable(
  'key_crates',
  {
    keyId: text('key_id')
      .notNull()
      .references(() => keys.id),
    crateId: text('crate_id')
      .notNull()
      .references(() => crates.id),
  },
  (t) => [primaryKey({ columns: [t.keyId, t.crateId] })],
)

export const collectionCrates = pgTable(
  'collection_crates',
  {
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id),
    crateId: text('crate_id')
      .notNull()
      .references(() => crates.id),
  },
  (t) => [
    primaryKey({ columns: [t.collectionId, t.crateId] }),
    index('collection_crates_crate_id_idx').on(t.crateId),
  ],
)
