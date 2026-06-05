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
import { fetchMoreKeychains } from './actions'
import type { InfiniteBaseItem } from '@/types/custom'
import type { Metadata } from 'next'

const PAGE_SIZE = 52

export const metadata: Metadata = {
  title: 'CS2 Keychains | Browse All Counter-Strike 2 Keychains',
  description: `Explore all Keychains in Counter-Strike 2. Discover detailed information about each keychain, including unique designs, market prices, and rarity.`,
  alternates: {
    canonical: '/keychains',
  },
}

async function getData(): Promise<InfiniteBaseItem[]> {
  const data = await db
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
  return data
}

export default async function KeychainsPage() {
  const data = await getData()

  if (!data.length) return notFound()

  return (
    <InternalContainer>
      <BreadCrumbBar active="Keychains" />
      <PageTitle title="All CS2 Keychains" />
      <IntroParagraph content="Browse all keychains available in Counter-Strike 2. Keychains are cosmetic charm items that can be attached to weapons, adding a personal touch to your loadout. Each keychain features a unique design with varying rarity levels." />
      <InfiniteItemGrid initialItems={data} fetchMore={fetchMoreKeychains} basePath="/keychains" pageSize={PAGE_SIZE} />
    </InternalContainer>
  )
}
