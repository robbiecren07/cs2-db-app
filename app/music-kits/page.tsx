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
import ItemCard from './ItemCard'
import type { MusicKitWithRarity } from '@/types/custom'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'CS2 Music Kits | Browse All Counter-Strike 2 Music Kits',
  description: `Explore all Music Kits available in Counter-Strike 2. Browse every music kit including exclusive StatTrak versions, with rarity details and Steam Community Market prices.`,
  alternates: {
    canonical: '/music-kits',
  },
}

async function getData(): Promise<MusicKitWithRarity[] | null> {
  const data = await db
    .select({
      id: schema.musicKits.id,
      name: schema.musicKits.name,
      slug: schema.musicKits.slug,
      rarityId: schema.musicKits.rarityId,
      description: schema.musicKits.description,
      exclusive: schema.musicKits.exclusive,
      marketHashName: schema.musicKits.marketHashName,
      image: schema.musicKits.image,
      defIndex: schema.musicKits.defIndex,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.musicKits)
    .leftJoin(schema.rarities, eq(schema.musicKits.rarityId, schema.rarities.id))
    .orderBy(asc(schema.musicKits.name))
  if (!data.length) return null
  return data.sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))
}

export default async function MusicKitsPage() {
  const data = await getData()

  if (!data) return notFound()

  return (
    <InternalContainer>
      <BreadCrumbBar active="Music Kits" />
      <PageTitle title="All CS2 Music Kits" />

      <IntroParagraph content="Browse all Music Kits available in Counter-Strike 2. Music Kits replace the in-game background music with custom tracks from artists and composers. Some kits are exclusive and feature StatTrak technology to track your MVP count." />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 lg:py-12">
        {data.map((item, index) => (
          <ItemCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </InternalContainer>
  )
}
