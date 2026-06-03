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
import type { KeychainWithRarity } from '@/types/custom'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'CS2 Keychains | Browse All Counter-Strike 2 Keychains',
  description: `Explore all Keychains in Counter-Strike 2. Discover detailed information about each keychain, including unique designs, market prices, and rarity.`,
  alternates: {
    canonical: '/keychains',
  },
}

async function getData(): Promise<KeychainWithRarity[] | null> {
  const data = await db
    .select({
      id: schema.keychains.id,
      name: schema.keychains.name,
      slug: schema.keychains.slug,
      rarityId: schema.keychains.rarityId,
      description: schema.keychains.description,
      marketHashName: schema.keychains.marketHashName,
      image: schema.keychains.image,
      defIndex: schema.keychains.defIndex,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.keychains)
    .leftJoin(schema.rarities, eq(schema.keychains.rarityId, schema.rarities.id))
    .orderBy(asc(schema.keychains.name))
  if (!data.length) return null
  return data.sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))
}

export default async function KeychainsPage() {
  const data = await getData()

  if (!data) return notFound()

  return (
    <InternalContainer>
      <BreadCrumbBar active="Keychains" />
      <PageTitle title="All CS2 Keychains" />

      <IntroParagraph content="Browse all keychains available in Counter-Strike 2. Keychains are cosmetic charm items that can be attached to weapons, adding a personal touch to your loadout. Each keychain features a unique design with varying rarity levels." />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 lg:py-12">
        {data.map((item, index) => (
          <ItemCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </InternalContainer>
  )
}
