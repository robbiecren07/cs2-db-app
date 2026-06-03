'use cache'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import PageTitle from '@/components/PageTitle'
import InternalContainer from '@/components/InternalContainer'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import { SkinCard } from '@/components/SkinCard'
import { rarityOrder } from '@/lib/helpers'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Collection, SkinWithDetails } from '@/types/custom'
import type { Metadata } from 'next'

interface Data {
  data: Collection | null
  skins: SkinWithDetails[]
}

type Props = {
  params: Promise<{ collection: string }>
}


export async function generateStaticParams() {
  const data = await db.select({ slug: schema.collections.slug }).from(schema.collections)
  return data.map((c) => ({ collection: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params
  const data = await db.select().from(schema.collections).where(eq(schema.collections.slug, collection)).limit(1)

  if (!data.length) return {}

  return {
    title: `${data[0].name} | CS2 Collection | Counter-Strike 2 Skins`,
    description: `Discover the ${data[0].name} in Counter-Strike 2. Browse through the unique weapon skins, find detailed information on prices and rarity, and stay updated with the latest additions to the collection.`,
    alternates: {
      canonical: `/collections/${collection}`,
    },
    openGraph: {
      images: [
        {
          url: data[0].image ?? '',
          width: 512,
          height: 384,
          alt: `${data[0].name} skin modal`,
        },
      ],
    },
  }
}

async function getData(collection: string): Promise<Data> {
  const [collectionData, skinsData] = await Promise.all([
    db.select().from(schema.collections).where(eq(schema.collections.slug, collection)).limit(1),
    db
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
      .innerJoin(schema.skinCollections, eq(schema.skinCollections.skinId, schema.skins.id))
      .innerJoin(schema.collections, eq(schema.skinCollections.collectionId, schema.collections.id))
      .where(eq(schema.collections.slug, collection)),
  ])

  if (!collectionData.length) return { data: null, skins: [] }

  const skins = skinsData
    .map((s) => ({ ...s, collectionName: collectionData[0].name, collectionSlug: collection }))
    .sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))

  return { data: collectionData[0], skins }
}

export default async function CollectionPage({ params }: Props) {
  const { collection } = await params
  const { data, skins } = await getData(collection)

  if (!data || !skins) {
    return notFound()
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProductCollection',
    name: `${data.name} Collection`,
    description: `Discover the ${data.name} Collection in Counter-Strike 2. Browse through unique weapon skins, find detailed information on prices and rarity, and stay updated with the latest additions.`,
    image: data.image,
    url: `https://cs2skinsdb.com/collections/${data.slug}`,
    brand: {
      '@type': 'Thing',
      name: 'Counter-Strike 2',
    },
    isRelatedTo: skins.map((skin) => ({
      '@type': 'Product',
      name: skin.name,
      description: skin.description || `A ${skin.rarityName} rarity skin for ${skin.weaponName}.`,
      image: skin.image,
      url: `https://cs2skinsdb.com/skins/${skin.slug}`,
    })),
  }

  return (
    <InternalContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <BreadCrumbBar active={data.name} parent="Collections" parentHref="/collections" />
      <PageTitle title={data.name} />

      <div className="w-full flex flex-col gap-6 xl:gap-10 pt-4 pb-8">
        <div className="grow flex flex-col lg:flex-row justify-center items-center gap-4 py-4 lg:py-8">
          <div className="flex-1 flex justify-center items-center">
            {data.image && (
              <Image
                src={data.image}
                width="198"
                height="112"
                className="aspect-video object-contain"
                alt={`${data.name} - visual modal`}
                priority
              />
            )}
          </div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skins.map((skin, i) => {
            return (
              <SkinCard key={skin.id} weapon={skin.weaponSlug ?? ''} skin={skin} index={i}>
                <h2 className="sr-only">{skin.weaponName}</h2>
              </SkinCard>
            )
          })}
        </div>
      </div>
    </InternalContainer>
  )
}
