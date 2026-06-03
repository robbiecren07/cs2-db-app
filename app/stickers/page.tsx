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
import type { StickerWithRarity } from '@/types/custom'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'CS2 Stickers | Browse All Counter-Strike 2 Stickers',
  description: `Explore all Stickers in Counter-Strike 2. Discover autograph stickers, team stickers, event stickers, and more — including market prices and rarity details.`,
  alternates: {
    canonical: '/stickers',
  },
}

async function getData(): Promise<StickerWithRarity[] | null> {
  const data = await db
    .select({
      id: schema.stickers.id,
      name: schema.stickers.name,
      slug: schema.stickers.slug,
      rarityId: schema.stickers.rarityId,
      description: schema.stickers.description,
      type: schema.stickers.type,
      effect: schema.stickers.effect,
      tournamentId: schema.stickers.tournamentId,
      marketHashName: schema.stickers.marketHashName,
      image: schema.stickers.image,
      defIndex: schema.stickers.defIndex,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.stickers)
    .leftJoin(schema.rarities, eq(schema.stickers.rarityId, schema.rarities.id))
    .orderBy(asc(schema.stickers.name))
  if (!data.length) return null
  return data.sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))
}

export default async function StickersPage() {
  const data = await getData()

  if (!data) return notFound()

  return (
    <InternalContainer>
      <BreadCrumbBar active="Stickers" />
      <PageTitle title="All CS2 Stickers" />

      <IntroParagraph content="Browse all stickers available in Counter-Strike 2. CS2 stickers include autograph stickers from professional players, team stickers, event stickers, and community designs. Apply them to your weapons for unique customization. Stickers come in various finishes including Holo, Foil, Gold, Glitter, and more." />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 lg:py-12">
        {data.map((item, index) => (
          <ItemCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </InternalContainer>
  )
}
