'use cache'

import { notFound } from 'next/navigation'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { rarityOrder } from '@/lib/helpers'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import IntroParagraph from '@/components/IntroParagraph'
import { AgentsCard } from './AgentsCard'
import type { Metadata } from 'next'
import type { AgentWithDetails } from '@/types/custom'


export const metadata: Metadata = {
  title: 'CS2 Agents Skins | Browse All Counter-Strike 2 Agents',
  description: `Explore all Agent Skins in Counter-Strike 2. Discover detailed information about each agent, including unique designs, market prices, and rarity. Stay updated with the latest agent skins and enhance your gaming experience with exclusive characters.`,
  alternates: {
    canonical: '/agents',
  },
}

async function getData(): Promise<AgentWithDetails[] | null> {
  const agentsData = await db
    .select({
      id: schema.agents.id,
      name: schema.agents.name,
      slug: schema.agents.slug,
      shortName: schema.agents.shortName,
      subName: schema.agents.subName,
      rarityId: schema.agents.rarityId,
      teamId: schema.agents.teamId,
      description: schema.agents.description,
      marketHashName: schema.agents.marketHashName,
      image: schema.agents.image,
      defIndex: schema.agents.defIndex,
      modelPlayer: schema.agents.modelPlayer,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.agents)
    .leftJoin(schema.rarities, eq(schema.agents.rarityId, schema.rarities.id))
    .orderBy(asc(schema.agents.name))

  const { getCollectionsForAgents } = await import('@/db/queries')
  const collectionMap = await getCollectionsForAgents(agentsData.map((a) => a.id))
  return agentsData
    .map((a) => ({
      ...a,
      collectionName: collectionMap.get(a.id)?.collectionName ?? null,
      collectionSlug: collectionMap.get(a.id)?.collectionSlug ?? null,
    }))
    .sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))
}

export default async function AgentsPage() {
  const data = await getData()

  if (!data) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active="Agents" />
      <PageTitle title="All CS2 Agent Skins" />

      <IntroParagraph content="Welcome to the Agent Skins section of CS2 Skins DB. This is your go-to resource for exploring all the unique agent skins available in Counter-Strike 2. Each agent skin brings a distinctive look and personality to the game, allowing you to stand out on the battlefield. Whether you're seeking to add rare characters to your collection or just want to see the latest additions, our detailed database provides all the information you need. Dive into the world of CS2 Agent Skins and discover the perfect characters to enhance your gameplay." />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 lg:py-12">
        {data.map((item, index) => {
          return <AgentsCard key={item.id} item={item} index={index} />
        })}
      </div>
    </InternalContainer>
  )
}
