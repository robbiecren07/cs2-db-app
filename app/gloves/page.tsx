'use cache'

import { notFound } from 'next/navigation'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import PageTitle from '@/components/PageTitle'
import InternalContainer from '@/components/InternalContainer'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import IntroParagraph from '@/components/IntroParagraph'
import { GloveCard } from './GloveCard'
import type { Glove } from '@/types/custom'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'All CS2 Gloves | Browse Counter-Strike 2 Gloves Collection',
  description: `Explore all CS2 gloves in Counter-Strike 2. Discover detailed information on each glove's unique design, prices, and rarity. Stay updated with the latest and most coveted gloves in the game.`,
  alternates: {
    canonical: '/gloves',
  },
}

async function getData(): Promise<Glove[]> {
  const data = await db
    .select({
      id: schema.skins.id,
      name: schema.skins.name,
      slug: schema.skins.slug,
      shortSlug: schema.skins.shortSlug,
      shortName: schema.skins.shortName,
      weaponId: schema.skins.weaponId,
      weaponName: schema.skins.weaponName,
      weaponSlug: schema.skins.weaponSlug,
      categoryId: schema.skins.categoryId,
      categoryName: schema.skins.categoryName,
      rarityId: schema.skins.rarityId,
      patternId: schema.skins.patternId,
      patternName: schema.skins.patternName,
      paintIndex: schema.skins.paintIndex,
      minFloat: schema.skins.minFloat,
      maxFloat: schema.skins.maxFloat,
      stattrak: schema.skins.stattrak,
      souvenir: schema.skins.souvenir,
      featured: schema.skins.featured,
      teamId: schema.skins.teamId,
      description: schema.skins.description,
      marketHashName: schema.skins.marketHashName,
      legacyModel: schema.skins.legacyModel,
      image: schema.skins.image,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.skins)
    .leftJoin(schema.rarities, eq(schema.skins.rarityId, schema.rarities.id))
    .where(eq(schema.skins.categoryName, 'Gloves'))
    .orderBy(asc(schema.skins.name))
  return data.map((g) => ({ ...g, collectionName: null, collectionSlug: null }))
}

export default async function GlovesPage() {
  const data = await getData()

  if (!data.length) {
    return notFound()
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'All CS2 Gloves | Browse Counter-Strike 2 Gloves Collection',
    description:
      "Explore all CS2 gloves in Counter-Strike 2. Discover detailed information on each glove's unique design, prices, and rarity. Stay updated with the latest and most coveted gloves in the game.",
    url: 'https://cs2skinsdb.com/gloves',
    itemListElement: data.map((glove, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: glove.name,
      description: glove.description || `Detailed information on the ${glove.name} gloves.`,
      image: glove.image,
      url: `https://cs2skinsdb.com/gloves/${glove.slug}`,
    })),
  }

  return (
    <InternalContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <BreadCrumbBar active="Gloves" />
      <PageTitle title="All CS2 Gloves" />

      <IntroParagraph content="Welcome to the ultimate collection of CS2 gloves in Counter-Strike 2. Our comprehensive database offers detailed insights into every available glove, showcasing their unique designs, prices, and rarity. Whether you are looking to enhance your in-game style or searching for the rarest finds, this page provides all the information you need. Dive in and explore the latest and most iconic gloves that CS2 has to offer." />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 lg:py-12">
        {data.map((glove, i) => {
          return <GloveCard key={glove.id} glove={glove} index={i} />
        })}
      </div>
    </InternalContainer>
  )
}
