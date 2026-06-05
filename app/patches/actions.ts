'use server'

import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { rarityOrderExpr } from '@/db/ordering'
import type { InfiniteBaseItem } from '@/types/custom'

const PAGE_SIZE = 52

export async function fetchMorePatches(offset: number): Promise<InfiniteBaseItem[]> {
  return db
    .select({
      id: schema.patches.id,
      name: schema.patches.name,
      shortName: schema.patches.shortName,
      slug: schema.patches.slug,
      image: schema.patches.image,
      rarityId: schema.patches.rarityId,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.patches)
    .leftJoin(schema.rarities, eq(schema.patches.rarityId, schema.rarities.id))
    .orderBy(rarityOrderExpr(schema.patches.rarityId), asc(schema.patches.name))
    .limit(PAGE_SIZE)
    .offset(offset)
}
