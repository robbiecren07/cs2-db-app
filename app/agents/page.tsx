'use cache'

import { notFound } from 'next/navigation'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { rarityOrderExpr } from '@/db/ordering'
import { getCollectionsForAgents } from '@/db/queries'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import IntroParagraph from '@/components/IntroParagraph'
import InfiniteItemGrid from '@/components/InfiniteItemGrid'
import { fetchMoreAgents } from './actions'
import type { InfiniteBaseItem } from '@/types/custom'
import type { Metadata } from 'next'

const PAGE_SIZE = 52

export const metadata: Metadata = {
  title: 'CS2 Agents Skins | Browse All Counter-Strike 2 Agents',
  description: `Explore all Agent Skins in Counter-Strike 2. Discover detailed information about each agent, including unique designs, market prices, and rarity. Stay updated with the latest agent skins and enhance your gaming experience with exclusive characters.`,
  alternates: {
    canonical: '/agents',
  },
}

async function getData(): Promise<InfiniteBaseItem[]> {
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

  const collectionMap = await getCollectionsForAgents(rows.map((r) => r.id))
  return rows.map((r) => ({
    ...r,
    collectionName: collectionMap.get(r.id)?.collectionName ?? null,
  }))
}

export default async function AgentsPage() {
  const data = await getData()

  if (!data.length) return notFound()

  return (
    <InternalContainer>
      <BreadCrumbBar active="Agents" />
      <PageTitle title="All CS2 Agent Skins" />
      <IntroParagraph content="Welcome to the Agent Skins section of CS2 Skins DB. This is your go-to resource for exploring all the unique agent skins available in Counter-Strike 2. Each agent skin brings a distinctive look and personality to the game, allowing you to stand out on the battlefield." />
      <InfiniteItemGrid initialItems={data} fetchMore={fetchMoreAgents} basePath="/agents" pageSize={PAGE_SIZE} />
    </InternalContainer>
  )
}
