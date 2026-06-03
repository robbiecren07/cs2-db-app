import { notFound } from 'next/navigation'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc, and } from 'drizzle-orm'
import { rarityOrder } from '@/lib/helpers'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import FloatBar from '@/components/FloatBar'
import GlobalCollectionCard from '@/components/GlobalCollectionCard'
import GlobalCaseCard from '@/components/GlobalCaseCard'
import MiniSkinCard from './MiniSkinCard'
import MainCard from './MainCard'
import MarketTable from './MarketTable'
import Image from 'next/image'
import type { Collection, SkinWithDetails } from '@/types/custom'
import type { Metadata } from 'next'

interface Data {
  skin: SkinWithDetails | null
  collection: Collection | null
  collectionSkins: SkinWithDetails[]
}

type Props = {
  params: { weapon: string; skin: string }
}


export async function generateStaticParams() {
  'use cache'
  const data = await db
    .select({ weaponSlug: schema.skins.weaponSlug, shortSlug: schema.skins.shortSlug })
    .from(schema.skins)
  return data.map((item) => ({
    weapon: item.weaponSlug ?? '',
    skin: item.shortSlug,
  }))
}

const skinSelect = {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  'use cache'
  const { weapon, skin } = await params
  const data = await db
    .select({ name: schema.skins.name, image: schema.skins.image })
    .from(schema.skins)
    .where(and(eq(schema.skins.weaponSlug, weapon), eq(schema.skins.shortSlug, skin)))
    .limit(1)
  if (!data.length) return {}
  return {
    title: `${data[0].name} | CS2 Skin Prices, Stats, and Info`,
    description: `Discover the ${data[0].name} in Counter-Strike 2. Check current Steam market prices, explore collection and case details, and get in-depth information on pattern index, float values, and more for this skin.`,
    alternates: { canonical: `/weapons/${weapon}/${skin}` },
    openGraph: {
      images: [{ url: data[0].image ?? '', width: 512, height: 384, alt: `${data[0].name} skin modal` }],
    },
  }
}

async function getData(weapon: string, skin: string): Promise<Data> {
  'use cache'
  const skinData = await db
    .select(skinSelect)
    .from(schema.skins)
    .leftJoin(schema.rarities, eq(schema.skins.rarityId, schema.rarities.id))
    .where(and(eq(schema.skins.weaponSlug, weapon), eq(schema.skins.shortSlug, skin)))
    .limit(1)

  if (!skinData.length) return { skin: null, collection: null, collectionSkins: [] }

  const { getCollectionsForSkins, getCasesForSkin } = await import('@/db/queries')
  const [collectionRows, inCases] = await Promise.all([
    getCollectionsForSkins([skinData[0].id]),
    getCasesForSkin(skinData[0].id),
  ])

  const collectionSlug = collectionRows.get(skinData[0].id)?.collectionSlug ?? null
  const collectionName = collectionRows.get(skinData[0].id)?.collectionName ?? null

  const enrichedSkin: SkinWithDetails = { ...skinData[0], collectionName, collectionSlug, inCases }

  if (!collectionSlug) return { skin: enrichedSkin, collection: null, collectionSkins: [] }

  const [collectionData, collectionSkinsData] = await Promise.all([
    db.select().from(schema.collections).where(eq(schema.collections.slug, collectionSlug)).limit(1),
    db
      .select(skinSelect)
      .from(schema.skins)
      .leftJoin(schema.rarities, eq(schema.skins.rarityId, schema.rarities.id))
      .innerJoin(schema.skinCollections, eq(schema.skinCollections.skinId, schema.skins.id))
      .innerJoin(schema.collections, eq(schema.skinCollections.collectionId, schema.collections.id))
      .where(eq(schema.collections.slug, collectionSlug))
      .orderBy(asc(schema.skins.rarityId)),
  ])

  const collectionSkins: SkinWithDetails[] = collectionSkinsData
    .map((s) => ({ ...s, collectionName, collectionSlug }))
    .sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))

  return {
    skin: enrichedSkin,
    collection: collectionData[0] ?? null,
    collectionSkins,
  }
}

export default async function SkinPage({ params }: Props) {
  const { weapon, skin } = await params
  const { skin: data, collection, collectionSkins } = await getData(weapon, skin)

  if (!data) {
    return notFound()
  }

  const inCases = data.inCases ?? []

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description
      ? data.description.split('\\n')[0]
      : `Discover the ${data.name} skin for ${data.weaponName} in Counter-Strike 2.`,
    image: data.image,
    url: `https://cs2skinsdb.com/weapons/${weapon}/${data.shortSlug}`,
    brand: { '@type': 'Thing', name: 'Counter-Strike 2' },
    sku: data.paintIndex,
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: 'N/A',
      highPrice: 'N/A',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Steam Community Market' },
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Rarity', value: data.rarityName },
      { '@type': 'PropertyValue', name: 'Weapon', value: data.weaponName },
      { '@type': 'PropertyValue', name: 'Float Value', value: `${data.minFloat} - ${data.maxFloat}` },
    ],
  }

  return (
    <InternalContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <BreadCrumbBar
        active={data.shortName ? data.shortName : data.name}
        parent={(data.weaponName ?? '').replace('★ ', '')}
        parentHref={`/weapons/${weapon}`}
        grandparent="Weapons"
        grandparentHref="/weapons"
      />
      <PageTitle title={data.name} />

      <div className="w-full flex flex-wrap gap-y-10 py-8 lg:py-12">
        <div className="shrink basis-full lg:basis-1/2 px-3 flex flex-col gap-6 h-full max-lg:order-1">
          <MainCard skin={data} />
        </div>

        <div className="shrink basis-full lg:basis-1/2 px-3 flex flex-col space-y-8 max-lg:order-4 overflow-hidden">
          <div className="w-full space-y-2 px-2">
            <h2 className="text-lg text-center">Steam Community Market Prices</h2>
            <MarketTable skin={data} />
          </div>

          <div className="w-full flex items-center justify-center gap-3">
            <a
              href={`https://steamcommunity.com/market/listings/730/${encodeURIComponent(
                `${data.name} (Minimal Wear)`
              )}`}
              className="h-12 px-4 lg:px-6 py-2 inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-base font-semibold
              ring-offset-background transition-colors bg-foreground text-background hover:bg-secondary-foreground focus-visible:outline-hidden
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              target="_blank"
              rel="nofollow noreferrer"
              aria-label={`View ${data.name} on Steam Market`}
            >
              View on Steam Market
            </a>

            <a
              href={`https://dmarket.com/ingame-items/item-list/csgo-skins?title=${encodeURIComponent(
                data.name
              )}&ref=YJATPCd833`}
              className="h-12 px-4 lg:px-6 py-2 inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-base font-semibold
              ring-offset-background transition-colors bg-foreground text-background hover:bg-secondary-foreground focus-visible:outline-hidden
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              target="_blank"
              rel="nofollow"
            >
              Buy on
              <Image width={27} height={24} src="/dm-ua-logo.png" alt="DMARKET logo" unoptimized />
              DMARKET
            </a>
          </div>

          <FloatBar minFloat={data.minFloat} maxFloat={data.maxFloat} />
        </div>

        <div className="shrink basis-full lg:basis-1/2 self-stretch px-3 max-lg:order-3">
          {collection || inCases.length > 0 ? (
            <div className="w-full flex flex-wrap justify-center p-4 bg-muted rounded-lg">
              {collection && <GlobalCollectionCard collection={collection} />}
              {inCases.length > 0 && <GlobalCaseCard item={{ inCases }} />}
            </div>
          ) : null}
        </div>

        <div className="shrink basis-full self-start lg:basis-1/2 px-3 max-lg:order-2">
          <div className="w-full h-full p-4 bg-muted space-y-3 rounded-lg text-accent-foreground text-sm">
            {data.description && (
              <p>
                <span className="font-medium text-secondary-foreground">Description:</span>{' '}
                {data.description.split('\\n')[0]}
              </p>
            )}
            {data.paintIndex && (
              <p>
                <span className="font-medium text-secondary-foreground">Finish Catalog:</span> {data.paintIndex}
              </p>
            )}
          </div>
        </div>

        {collection && collectionSkins && (
          <div className="shrink basis-full self-stretch flex flex-col gap-4 px-3 pt-6 lg:pt-10 max-lg:order-5">
            <h2 className="text-2xl font-medium pt-4">{collection.name}</h2>
            <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {collectionSkins.map((s) => (
                <MiniSkinCard key={s.id} weapon={s.weaponSlug ?? ''} skin={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </InternalContainer>
  )
}
