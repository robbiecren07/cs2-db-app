'use cache'

import { notFound } from 'next/navigation'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { rarityOrderExpr } from '@/db/ordering'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import IntroParagraph from '@/components/IntroParagraph'
import InfiniteItemGrid from '@/components/InfiniteItemGrid'
import { fetchMorePatches } from './actions'
import type { InfiniteBaseItem } from '@/types/custom'
import type { Metadata } from 'next'

const PAGE_SIZE = 52

export const metadata: Metadata = {
  title: 'CS2 Agent Patches | Browse All Counter-Strike 2 Patches',
  description: `Explore all Agent Patches in Counter-Strike 2. Discover detailed information about each patch, including unique designs, market prices, and rarity.`,
  alternates: {
    canonical: '/patches',
  },
}

async function getData(): Promise<InfiniteBaseItem[]> {
  const data = await db
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
  return data
}

export default async function PatchesPage() {
  const data = await getData()

  if (!data.length) return notFound()

  return (
    <InternalContainer>
      <BreadCrumbBar active="Patches" />
      <PageTitle title="All CS2 Agent Patches" />
      <IntroParagraph content="Welcome to the Agent Patches section of CS2 Skins DB. Here, you can explore a comprehensive collection of patches available for agents in Counter-Strike 2. Each patch offers a unique design, allowing you to customize your agents and add a personal touch to your gameplay." />
      <InfiniteItemGrid initialItems={data} fetchMore={fetchMorePatches} basePath="/patches" pageSize={PAGE_SIZE} />
    </InternalContainer>
  )
}
