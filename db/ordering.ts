import { sql } from 'drizzle-orm'
import type { AnyColumn } from 'drizzle-orm'

// SQL CASE replicating rarityOrder from lib/helpers for DB-side sorting.
// Accepts a column reference so it works across all tables that have rarity_id.
export const rarityOrderExpr = (col: AnyColumn) => sql`
  CASE ${col}
    WHEN 'rarity_contraband'           THEN 1
    WHEN 'rarity_contraband_weapon'    THEN 1
    WHEN 'rarity_ancient'              THEN 2
    WHEN 'rarity_ancient_weapon'       THEN 2
    WHEN 'rarity_ancient_character'    THEN 2
    WHEN 'rarity_legendary'            THEN 3
    WHEN 'rarity_legendary_weapon'     THEN 3
    WHEN 'rarity_legendary_character'  THEN 3
    WHEN 'rarity_mythical'             THEN 4
    WHEN 'rarity_mythical_weapon'      THEN 4
    WHEN 'rarity_mythical_character'   THEN 4
    WHEN 'rarity_rare'                 THEN 5
    WHEN 'rarity_rare_weapon'          THEN 5
    WHEN 'rarity_rare_character'       THEN 5
    WHEN 'rarity_uncommon_weapon'      THEN 6
    WHEN 'rarity_common'               THEN 7
    WHEN 'rarity_common_weapon'        THEN 7
    WHEN 'rarity_common_highlight'     THEN 7
    WHEN 'rarity_default'              THEN 8
    ELSE 999
  END
`
