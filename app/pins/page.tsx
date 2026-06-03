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
import type { CollectableWithRarity } from '@/types/custom'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'CS2 Pins | Browse All Counter-Strike 2 Pins',
  description: `Explore all collectable pins in Counter-Strike 2. Discover detailed information about each pin, including unique designs, market prices, and rarity.`,
  alternates: {
    canonical: '/pins',
  },
}

async function getData(): Promise<CollectableWithRarity[] | null> {
  const data = await db
    .select({
      id: schema.collectables.id,
      name: schema.collectables.name,
      slug: schema.collectables.slug,
      shortName: schema.collectables.shortName,
      rarityId: schema.collectables.rarityId,
      description: schema.collectables.description,
      type: schema.collectables.type,
      genuine: schema.collectables.genuine,
      marketHashName: schema.collectables.marketHashName,
      image: schema.collectables.image,
      defIndex: schema.collectables.defIndex,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.collectables)
    .leftJoin(schema.rarities, eq(schema.collectables.rarityId, schema.rarities.id))
    .where(eq(schema.collectables.type, 'Pin'))
    .orderBy(asc(schema.collectables.name))
  if (!data.length) return null
  return data.sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))
}

export default async function PinsPage() {
  const data = await getData()

  if (!data) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active="Pins" />
      <PageTitle title="All CS2 Pins" />

      <IntroParagraph content="Welcome to the collectable Pins section of CS2 Skins DB. Here, you can explore a comprehensive collection of pins available for agents in Counter-Strike 2. Each patch offers a unique design, allowing you to customize your agents and add a personal touch to your gameplay. Whether you're looking for rare pins to complete your collection or want to stay updated with the latest additions, our detailed database provides all the information you need. Dive into the world of CS2 Agent pins and discover the perfect customizations to enhance your gaming experience." />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 lg:py-12">
        {data.map((item, index) => {
          return <ItemCard key={item.id} item={item} index={index} />
        })}
      </div>
    </InternalContainer>
  )
}
