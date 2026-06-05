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
import { fetchMoreStickers } from './actions'
import type { InfiniteBaseItem } from '@/types/custom'
import type { Metadata } from 'next'

const PAGE_SIZE = 52

export const metadata: Metadata = {
  title: 'CS2 Stickers | Browse All Counter-Strike 2 Stickers',
  description: `Explore all Stickers in Counter-Strike 2. Discover autograph stickers, team stickers, event stickers, and more — including market prices and rarity details.`,
  alternates: {
    canonical: '/stickers',
  },
}

async function getData(): Promise<InfiniteBaseItem[]> {
  const data = await db
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
  return data
}

export default async function StickersPage() {
  const data = await getData()

  if (!data.length) return notFound()

  return (
    <InternalContainer>
      <BreadCrumbBar active="Stickers" />
      <PageTitle title="All CS2 Stickers" />
      <IntroParagraph content="Browse all stickers available in Counter-Strike 2. CS2 stickers include autograph stickers from professional players, team stickers, event stickers, and community designs. Apply them to your weapons for unique customization. Stickers come in various finishes including Holo, Foil, Gold, Glitter, and more." />
      <InfiniteItemGrid initialItems={data} fetchMore={fetchMoreStickers} basePath="/stickers" pageSize={PAGE_SIZE} />
    </InternalContainer>
  )
}
