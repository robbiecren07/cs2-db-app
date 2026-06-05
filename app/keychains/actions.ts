'use server'

import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { rarityOrderExpr } from '@/db/ordering'
import type { InfiniteBaseItem } from '@/types/custom'

const PAGE_SIZE = 52

export async function fetchMoreKeychains(offset: number): Promise<InfiniteBaseItem[]> {
  return db
    .select({
      id: schema.keychains.id,
      name: schema.keychains.name,
      slug: schema.keychains.slug,
      image: schema.keychains.image,
      rarityId: schema.keychains.rarityId,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.keychains)
    .leftJoin(schema.rarities, eq(schema.keychains.rarityId, schema.rarities.id))
    .orderBy(rarityOrderExpr(schema.keychains.rarityId), asc(schema.keychains.name))
    .limit(PAGE_SIZE)
    .offset(offset)
}
