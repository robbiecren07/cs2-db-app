'use server'

import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { rarityOrderExpr } from '@/db/ordering'
import type { InfiniteBaseItem } from '@/types/custom'

const PAGE_SIZE = 52

export async function fetchMoreGraffiti(offset: number): Promise<InfiniteBaseItem[]> {
  return db
    .select({
      id: schema.graffiti.id,
      name: schema.graffiti.name,
      slug: schema.graffiti.slug,
      image: schema.graffiti.image,
      rarityId: schema.graffiti.rarityId,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.graffiti)
    .leftJoin(schema.rarities, eq(schema.graffiti.rarityId, schema.rarities.id))
    .orderBy(rarityOrderExpr(schema.graffiti.rarityId), asc(schema.graffiti.name))
    .limit(PAGE_SIZE)
    .offset(offset)
}
