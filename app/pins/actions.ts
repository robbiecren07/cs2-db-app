'use server'

import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { rarityOrderExpr } from '@/db/ordering'
import type { InfiniteBaseItem } from '@/types/custom'

const PAGE_SIZE = 52

export async function fetchMorePins(offset: number): Promise<InfiniteBaseItem[]> {
  return db
    .select({
      id: schema.collectables.id,
      name: schema.collectables.name,
      shortName: schema.collectables.shortName,
      slug: schema.collectables.slug,
      image: schema.collectables.image,
      rarityId: schema.collectables.rarityId,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.collectables)
    .leftJoin(schema.rarities, eq(schema.collectables.rarityId, schema.rarities.id))
    .where(eq(schema.collectables.type, 'Pin'))
    .orderBy(rarityOrderExpr(schema.collectables.rarityId), asc(schema.collectables.name))
    .limit(PAGE_SIZE)
    .offset(offset)
}
