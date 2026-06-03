'use cache'

import { notFound } from 'next/navigation'
import { rarityOrder } from '@/lib/helpers'
import PageTitle from '@/components/PageTitle'
import InternalContainer from '@/components/InternalContainer'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import { SkinCard } from '@/components/SkinCard'
import Image from 'next/image'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import type { Crate, SkinWithDetails } from '@/types/custom'
import type { Metadata } from 'next'

interface Data {
  data: Crate | null
  skins: SkinWithDetails[]
}

type Props = {
  params: Promise<{ slug: string }>
}


export async function generateStaticParams() {
  const data = await db
    .select({ slug: schema.crates.slug })
    .from(schema.crates)
    .where(inArray(schema.crates.type, ['Souvenir', 'Souvenir Highlight']))
  return data.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await db
    .select()
    .from(schema.crates)
    .where(and(eq(schema.crates.slug, slug), inArray(schema.crates.type, ['Souvenir', 'Souvenir Highlight'])))
    .limit(1)

  if (!data.length) return {}

  return {
    title: `${data[0].name} | CS2 Skins DB`,
    description: `Discover the ${data[0].name} in Counter-Strike 2. Browse through the unique weapon skins, find detailed information on prices and rarity, and stay updated with the latest additions to the collection.`,
    alternates: {
      canonical: `/souvenir-packages/${slug}`,
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

async function getData(slug: string): Promise<Data> {
  const crateData = await db
    .select()
    .from(schema.crates)
    .where(and(eq(schema.crates.slug, slug), inArray(schema.crates.type, ['Souvenir', 'Souvenir Highlight'])))
    .limit(1)

  if (!crateData.length) return { data: null, skins: [] }

  const crateId = crateData[0].id

  const skinsData = await db
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
    .innerJoin(schema.skinCrates, eq(schema.skinCrates.skinId, schema.skins.id))
    .where(eq(schema.skinCrates.crateId, crateId))

  return {
    data: crateData[0],
    skins: skinsData
      .map((s) => ({ ...s, collectionName: null, collectionSlug: null }))
      .sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999)),
  }
}

export default async function SouvenirPage({ params }: Props) {
  const { slug } = await params
  const { data, skins } = await getData(slug)

  if (!data || !skins) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active={data.name} parent="Souvenir Packages" parentHref="/souvenir-packages" />
      <PageTitle title={data.name} />

      <div className="w-full flex flex-col gap-6 xl:gap-10 pt-4">
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
