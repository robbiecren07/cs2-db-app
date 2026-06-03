'use cache'

import { notFound } from 'next/navigation'
import InternalContainer from '@/components/InternalContainer'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import PageTitle from '@/components/PageTitle'
import { SkinCard } from '@/components/SkinCard'
import { GloveCard } from '@/app/gloves/GloveCard'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import type { SkinWithDetails } from '@/types/custom'
import type { Metadata } from 'next'

interface Data {
  knives: SkinWithDetails[]
  gloves: SkinWithDetails[]
}

type Props = {
  params: Promise<{ crate: string; slug: string }>
}


export async function generateStaticParams() {
  return [{ slug: 'knives' }, { slug: 'gloves' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { crate, slug } = await params

  const caseName = crate
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `${caseName} ${slug === 'knives' ? 'Knives' : 'Gloves'} | CS2 Skins DB`,
    description: `Discover the exclusive collection of ${slug} in the ${caseName} for Counter-Strike 2. Browse through the rare and coveted items, including detailed information on prices and rarity.`,
    alternates: {
      canonical: `/cases/${crate}/${slug}`,
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

async function getData(crate: string, slug: string): Promise<Data> {
  const crateData = await db.select().from(schema.crates).where(eq(schema.crates.slug, crate)).limit(1)
  if (!crateData.length) return { knives: [], gloves: [] }
  const crateId = crateData[0].id

  if (slug === 'knives') {
    const knives = await db
      .select(skinSelectWithRarity)
      .from(schema.skins)
      .leftJoin(schema.rarities, eq(schema.skins.rarityId, schema.rarities.id))
      .innerJoin(schema.skinCrates, eq(schema.skinCrates.skinId, schema.skins.id))
      .where(and(eq(schema.skinCrates.crateId, crateId), eq(schema.skins.categoryName, 'Knives')))
    return { knives: knives.map((k) => ({ ...k, collectionName: null, collectionSlug: null })), gloves: [] }
  }

  if (slug === 'gloves') {
    const gloves = await db
      .select(skinSelectWithRarity)
      .from(schema.skins)
      .leftJoin(schema.rarities, eq(schema.skins.rarityId, schema.rarities.id))
      .innerJoin(schema.skinCrates, eq(schema.skinCrates.skinId, schema.skins.id))
      .where(and(eq(schema.skinCrates.crateId, crateId), eq(schema.skins.categoryName, 'Gloves')))
    return { knives: [], gloves: gloves.map((g) => ({ ...g, collectionName: null, collectionSlug: null })) }
  }

  return { knives: [], gloves: [] }
}

export default async function CasePage({ params }: Props) {
  const { crate, slug } = await params
  const { knives, gloves } = await getData(crate, slug)

  if (!knives && !gloves) {
    return notFound()
  }

  const caseName = crate
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${caseName} ${slug === 'knives' ? 'Knives' : 'Gloves'}`,
    description: `Discover the exclusive collection of ${slug} in the ${caseName} for Counter-Strike 2. Browse through the rare and coveted items, including detailed information on prices and rarity.`,
    url: `https://cs2skinsdb.com/cases/${crate}/${slug}`,
    itemListElement:
      slug === 'knives'
        ? knives.map((skin, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: skin.name,
            description: `A rare ${skin.weaponName} knife from the ${caseName} Case.`,
            image: skin.image,
            url: `https://cs2skinsdb.com/weapons/${skin.weaponSlug}/${skin.slug}`,
          }))
        : gloves.map((glove, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: glove.name,
            description: `A pair of gloves from the ${caseName} Case.`,
            image: glove.image,
            url: `https://cs2skinsdb.com/gloves/${glove.slug}`,
          })),
  }

  if (slug === 'knives') {
    return (
      <InternalContainer>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

        <BreadCrumbBar
          active="Knives"
          parent={caseName}
          parentHref={`/cases/${crate}`}
          grandparent="Cases"
          grandparentHref="/cases"
        />
        <PageTitle title={`${caseName} Knives`} />

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 xl:pt-12">
          {knives.map((skin, i) => {
            if (skin.categoryName !== 'Knives') return null
            return (
              <SkinCard key={skin.id} weapon={skin.weaponSlug ?? ''} skin={skin} index={i}>
                <h2 className="sr-only">{skin.weaponName}</h2>
              </SkinCard>
            )
          })}
        </div>
      </InternalContainer>
    )
  }

  if (slug === 'gloves') {
    return (
      <InternalContainer>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

        <BreadCrumbBar
          active="Gloves"
          parent={caseName}
          parentHref={`/cases/${crate}`}
          grandparent="Cases"
          grandparentHref="/cases"
        />
        <PageTitle title={`${caseName} Gloves`} />

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 xl:pt-10">
          {gloves.map((skin, i) => (
            <GloveCard key={skin.id} glove={skin} index={i} />
          ))}
        </div>
      </InternalContainer>
    )
  }

  return notFound()
}
