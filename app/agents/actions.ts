'use server'

import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { rarityOrderExpr } from '@/db/ordering'
import { getCollectionsForAgents } from '@/db/queries'
import type { InfiniteBaseItem } from '@/types/custom'

const PAGE_SIZE = 52

export async function fetchMoreAgents(offset: number): Promise<InfiniteBaseItem[]> {
  const rows = await db
    .select({
      id: schema.agents.id,
      name: schema.agents.name,
      shortName: schema.agents.shortName,
      subName: schema.agents.subName,
      slug: schema.agents.slug,
      image: schema.agents.image,
      rarityId: schema.agents.rarityId,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.agents)
    .leftJoin(schema.rarities, eq(schema.agents.rarityId, schema.rarities.id))
    .orderBy(rarityOrderExpr(schema.agents.rarityId), asc(schema.agents.name))
    .limit(PAGE_SIZE)
    .offset(offset)

  const collectionMap = await getCollectionsForAgents(rows.map((r) => r.id))
  return rows.map((r) => ({
    ...r,
    collectionName: collectionMap.get(r.id)?.collectionName ?? null,
  }))
}
