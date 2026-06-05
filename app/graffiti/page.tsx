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
import { fetchMoreGraffiti } from './actions'
import type { InfiniteBaseItem } from '@/types/custom'
import type { Metadata } from 'next'

const PAGE_SIZE = 52

export const metadata: Metadata = {
  title: 'CS2 Graffiti | Browse All Counter-Strike 2 Graffiti',
  description: `Explore all Graffiti in Counter-Strike 2. Browse every graffiti design available, with rarity details and Steam Community Market prices.`,
  alternates: {
    canonical: '/graffiti',
  },
}

async function getData(): Promise<InfiniteBaseItem[]> {
  const data = await db
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
  return data
}

export default async function GraffitiPage() {
  const data = await getData()

  if (!data.length) return notFound()

  return (
    <InternalContainer>
      <BreadCrumbBar active="Graffiti" />
      <PageTitle title="All CS2 Graffiti" />
      <IntroParagraph content="Browse all graffiti available in Counter-Strike 2. CS2 graffiti are sprays you can apply to surfaces in-game to express yourself. Each graffiti features a unique design and can be found at varying rarity levels on the Steam Community Market." />
      <InfiniteItemGrid initialItems={data} fetchMore={fetchMoreGraffiti} basePath="/graffiti" pageSize={PAGE_SIZE} />
    </InternalContainer>
  )
}
