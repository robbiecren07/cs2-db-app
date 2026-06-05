'use cache'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import InternalContainer from '@/components/InternalContainer'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import PageTitle from '@/components/PageTitle'
import Image from 'next/image'
import { SkinCard } from '@/components/SkinCard'
import { CardContent, Card } from '@/components/ui/card'
import IntroParagraph from '@/components/IntroParagraph'
import { rarityOrder } from '@/lib/helpers'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, and, not } from 'drizzle-orm'
import type { Crate, SkinWithDetails } from '@/types/custom'
import type { Metadata } from 'next'

interface Data {
  data: Crate | null
  skins: SkinWithDetails[]
  gloves: SkinWithDetails[]
}

type Props = {
  params: Promise<{ crate: string }>
}


export async function generateStaticParams() {
  const data = await db.select({ slug: schema.crates.slug }).from(schema.crates).where(eq(schema.crates.type, 'Case'))
  return data.map((c) => ({ crate: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { crate } = await params
  const data = await db.select().from(schema.crates).where(eq(schema.crates.slug, crate)).limit(1)

  if (!data.length) return {}

  return {
    title: `${data[0].name} | CS2 Weapon Skins and Knives`,
    description: `Explore the ${data[0].name} in Counter-Strike 2. Discover the best weapon skins and knives available in this case, including their prices and rarity.`,
    alternates: {
      canonical: `/cases/${crate}`,
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

const skinSelectWithRarity = {
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
}

async function getData(crate: string): Promise<Data> {
  const crateData = await db.select().from(schema.crates).where(eq(schema.crates.slug, crate)).limit(1)
  if (!crateData.length) return { data: null, skins: [], gloves: [] }

  const crateId = crateData[0].id
  const [allSkins, gloveRows] = await Promise.all([
    db
      .select(skinSelectWithRarity)
      .from(schema.skins)
      .leftJoin(schema.rarities, eq(schema.skins.rarityId, schema.rarities.id))
      .innerJoin(schema.skinCrates, eq(schema.skinCrates.skinId, schema.skins.id))
      .where(and(eq(schema.skinCrates.crateId, crateId), not(eq(schema.skins.categoryName, 'Gloves')))),
    db
      .select(skinSelectWithRarity)
      .from(schema.skins)
      .leftJoin(schema.rarities, eq(schema.skins.rarityId, schema.rarities.id))
      .innerJoin(schema.skinCrates, eq(schema.skinCrates.skinId, schema.skins.id))
      .where(and(eq(schema.skinCrates.crateId, crateId), eq(schema.skins.categoryName, 'Gloves'))),
  ])

  const skins = allSkins
    .map((s) => ({ ...s, collectionName: null, collectionSlug: null }))
    .sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))
  const gloves = gloveRows.map((g) => ({ ...g, collectionName: null, collectionSlug: null }))

  return { data: crateData[0], skins, gloves }
}

export default async function CasePage({ params }: Props) {
  const { crate } = await params
  const { data, skins, gloves } = await getData(crate)

  if (!data) {
    return notFound()
  }

  const containsKnives = skins.some((skin) => skin.categoryName === 'Knives')
  const knivesCount = skins.filter((skin) => skin.categoryName === 'Knives').length
  const knifeImage = skins.find((skin) => skin.categoryName === 'Knives')?.image

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${data.name} Case`,
    description: `Explore the ${data.name} Case in Counter-Strike 2. Discover the best weapon skins, knives, and gloves available in this case.`,
    image: data.image,
    url: `https://cs2skinsdb.com/cases/${data.slug}`,
    releaseDate: data.firstSaleDate,
    brand: {
      '@type': 'Thing',
      name: 'Counter-Strike 2',
    },
    contains: [
      ...skins.map((skin) => ({
        '@type': 'Product',
        name: skin.name,
        description: skin.description || `A ${skin.rarityName} rarity skin for ${skin.weaponName}.`,
        image: skin.image,
        url: `https://cs2skinsdb.com/skins/${skin.slug}`,
      })),
      ...gloves.map((glove) => ({
        '@type': 'Product',
        name: glove.name,
        description: `A pair of gloves available in the ${data.name} Case.`,
        image: glove.image,
        url: `https://cs2skinsdb.com/gloves/${glove.slug}`,
      })),
    ],
  }

  return (
    <InternalContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <BreadCrumbBar active={data.name} parent="Cases" parentHref="/cases" />
      <PageTitle title={data.name} />

      <p className="text-center font-light pt-2">Released: {data.firstSaleDate}</p>

      <div className="w-full flex flex-col gap-6 xl:gap-10 pt-4">
        <div className="grow flex flex-col lg:flex-row justify-center items-center gap-4 py-4 lg:py-8">
          <div className="flex-1 flex justify-center items-center">
            {data.image && (
              <Image
                alt={`${data.name} skin modal`}
                className="h-49.5 w-full max-w-[256px] aspect-video object-contain"
                src={data.image}
                width={512}
                height={384}
                priority
              />
            )}
          </div>

          <div className="flex-1">
            <IntroParagraph content={data.description ?? ''} />
          </div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <h2 className="sr-only">{data.name} Case Skins</h2>
          {containsKnives && (
            <Link href={`/cases/${crate}/knives`} style={{ borderTopColor: '#e4ae39' }} className="card group w-full" prefetch={false}>
              <Card>
                <CardContent className="flex flex-col h-full p-4">
                  <h3 className="text-lg font-medium transition-colors group-hover:text-white">Knives</h3>
                  <p className="text-xs text-accent-foreground font-light">Rare Special Items</p>
                  <div className="my-4 mx-auto transition-transform group-hover:scale-110">
                    {knifeImage && (
                      <Image
                        src={knifeImage}
                        width="290"
                        height="150"
                        className="aspect-video object-contain"
                        alt={`${data.name} Knife - skin modal`}
                        priority
                      />
                    )}
                  </div>

                  <p className="text-xs text-accent-foreground font-light mt-auto">{knivesCount} Possible Knives</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {gloves && gloves.length > 0 && (
            <Link href={`/cases/${crate}/gloves`} style={{ borderTopColor: '#e4ae39' }} className="card group w-full" prefetch={false}>
              <Card>
                <CardContent className="flex flex-col h-full p-4">
                  <h3 className="text-lg font-medium transition-colors group-hover:text-white">Gloves</h3>
                  <p className="text-xs text-accent-foreground font-light">Rare Special Items</p>
                  <div className="my-4 mx-auto transition-transform group-hover:scale-110">
                    {gloves[0].image && (
                      <Image
                        src={gloves[0].image}
                        width="290"
                        height="150"
                        className="aspect-video object-contain"
                        alt={`${data.name} Gloves - skin modal`}
                        priority
                      />
                    )}
                  </div>

                  <p className="text-xs text-accent-foreground font-light mt-auto">{gloves.length} Possible Gloves</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {skins &&
            skins.map((skin, i) => {
              if (skin.categoryName === 'Knives') return null
              return <SkinCard key={skin.id} weapon={skin.weaponSlug ?? ''} skin={skin} index={i} />
            })}
        </div>
      </div>
    </InternalContainer>
  )
}
