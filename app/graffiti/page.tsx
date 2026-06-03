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
import type { GraffitiWithRarity } from '@/types/custom'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'CS2 Graffiti | Browse All Counter-Strike 2 Graffiti',
  description: `Explore all Graffiti in Counter-Strike 2. Browse every graffiti design available, with rarity details and Steam Community Market prices.`,
  alternates: {
    canonical: '/graffiti',
  },
}

async function getData(): Promise<GraffitiWithRarity[] | null> {
  const data = await db
    .select({
      id: schema.graffiti.id,
      name: schema.graffiti.name,
      slug: schema.graffiti.slug,
      rarityId: schema.graffiti.rarityId,
      description: schema.graffiti.description,
      marketHashName: schema.graffiti.marketHashName,
      image: schema.graffiti.image,
      defIndex: schema.graffiti.defIndex,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.graffiti)
    .leftJoin(schema.rarities, eq(schema.graffiti.rarityId, schema.rarities.id))
    .orderBy(asc(schema.graffiti.name))
  if (!data.length) return null
  return data.sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))
}

export default async function GraffitiPage() {
  const data = await getData()

  if (!data) return notFound()

  return (
    <InternalContainer>
      <BreadCrumbBar active="Graffiti" />
      <PageTitle title="All CS2 Graffiti" />

      <IntroParagraph content="Browse all graffiti available in Counter-Strike 2. CS2 graffiti are sprays you can apply to surfaces in-game to express yourself. Each graffiti features a unique design and can be found at varying rarity levels on the Steam Community Market." />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 lg:py-12">
        {data.map((item, index) => (
          <ItemCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </InternalContainer>
  )
}
