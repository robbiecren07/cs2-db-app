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
import { fetchMorePins } from './actions'
import type { InfiniteBaseItem } from '@/types/custom'
import type { Metadata } from 'next'

const PAGE_SIZE = 52

export const metadata: Metadata = {
  title: 'CS2 Pins | Browse All Counter-Strike 2 Pins',
  description: `Explore all collectable pins in Counter-Strike 2. Discover detailed information about each pin, including unique designs, market prices, and rarity.`,
  alternates: {
    canonical: '/pins',
  },
}

async function getData(): Promise<InfiniteBaseItem[]> {
  const data = await db
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
  return data
}

export default async function PinsPage() {
  const data = await getData()

  if (!data.length) return notFound()

  return (
    <InternalContainer>
      <BreadCrumbBar active="Pins" />
      <PageTitle title="All CS2 Pins" />
      <IntroParagraph content="Welcome to the collectable Pins section of CS2 Skins DB. Here, you can explore a comprehensive collection of pins available in Counter-Strike 2. Each pin offers a unique design with varying rarity levels. Dive in and discover your next favorite pin." />
      <InfiniteItemGrid initialItems={data} fetchMore={fetchMorePins} basePath="/pins" pageSize={PAGE_SIZE} />
    </InternalContainer>
  )
}
