'use server'

import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { rarityOrderExpr } from '@/db/ordering'
import type { InfiniteBaseItem } from '@/types/custom'

const PAGE_SIZE = 52

export async function fetchMoreStickers(offset: number): Promise<InfiniteBaseItem[]> {
  return db
    .select({
      id: schema.stickers.id,
      name: schema.stickers.name,
      slug: schema.stickers.slug,
      image: schema.stickers.image,
      rarityId: schema.stickers.rarityId,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
      effect: schema.stickers.effect,
    })
    .from(schema.stickers)
    .leftJoin(schema.rarities, eq(schema.stickers.rarityId, schema.rarities.id))
    .orderBy(rarityOrderExpr(schema.stickers.rarityId), asc(schema.stickers.name))
    .limit(PAGE_SIZE)
    .offset(offset)
}
