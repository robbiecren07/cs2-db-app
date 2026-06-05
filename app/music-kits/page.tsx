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
import { fetchMoreMusicKits } from './actions'
import type { InfiniteBaseItem } from '@/types/custom'
import type { Metadata } from 'next'

const PAGE_SIZE = 52

export const metadata: Metadata = {
  title: 'CS2 Music Kits | Browse All Counter-Strike 2 Music Kits',
  description: `Explore all Music Kits available in Counter-Strike 2. Browse every music kit including exclusive StatTrak versions, with rarity details and Steam Community Market prices.`,
  alternates: {
    canonical: '/music-kits',
  },
}

async function getData(): Promise<InfiniteBaseItem[]> {
  const data = await db
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
  return data
}

export default async function MusicKitsPage() {
  const data = await getData()

  if (!data.length) return notFound()

  return (
    <InternalContainer>
      <BreadCrumbBar active="Music Kits" />
      <PageTitle title="All CS2 Music Kits" />
      <IntroParagraph content="Browse all Music Kits available in Counter-Strike 2. Music Kits replace the in-game background music with custom tracks from artists and composers. Some kits are exclusive and feature StatTrak technology to track your MVP count." />
      <InfiniteItemGrid initialItems={data} fetchMore={fetchMoreMusicKits} basePath="/music-kits" pageSize={PAGE_SIZE} />
    </InternalContainer>
  )
}
