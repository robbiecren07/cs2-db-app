'use server'

import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { rarityOrderExpr } from '@/db/ordering'
import type { InfiniteBaseItem } from '@/types/custom'

const PAGE_SIZE = 52

export async function fetchMoreMusicKits(offset: number): Promise<InfiniteBaseItem[]> {
  return db
    .select({
      id: schema.musicKits.id,
      name: schema.musicKits.name,
      slug: schema.musicKits.slug,
      image: schema.musicKits.image,
      rarityId: schema.musicKits.rarityId,
      exclusive: schema.musicKits.exclusive,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.musicKits)
    .leftJoin(schema.rarities, eq(schema.musicKits.rarityId, schema.rarities.id))
    .orderBy(rarityOrderExpr(schema.musicKits.rarityId), asc(schema.musicKits.name))
    .limit(PAGE_SIZE)
    .offset(offset)
}
