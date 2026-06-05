import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, and, not, inArray, isNotNull } from 'drizzle-orm'
import { rarityOrder } from '@/lib/helpers'
import InternalContainer from '@/components/InternalContainer'
import { SkinCard } from '@/components/SkinCard'
import { CaseCard } from '@/components/CaseCard'
import Image from 'next/image'
import Link from 'next/link'
import HeroImage from '@/public/hero_image.png'
import type { Crate, SkinWithDetails } from '@/types/custom'
import type { Metadata } from 'next'

interface Data {
  crate: Crate | null
  skins: SkinWithDetails[]
  collection: Crate | null
  collectionSkins: SkinWithDetails[]
  popularSkins: SkinWithDetails[]
}

export const metadata: Metadata = {
  title: 'CS2 Skins DB | Browse All Counter-Strike 2 Skins',
  description: `Explore CS2 Skins DB, your ultimate resource for all Counter-Strike 2 skins, cases, collections, gloves, and more. Stay updated with the latest in-game items, market prices.`,
  alternates: {
    canonical: '/',
  },
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

async function getData(): Promise<Data> {
  'use cache'
  try {
    const FEATURED_CRATE_ID = 'crate-7007'
    const [crateResponse, skinsResponse, popularSkinsResponse] = await Promise.all([
      db.select().from(schema.crates).where(eq(schema.crates.id, FEATURED_CRATE_ID)).limit(1),
      db
        .select(skinSelect)
        .from(schema.skins)
        .leftJoin(schema.rarities, eq(schema.skins.rarityId, schema.rarities.id))
        .innerJoin(schema.skinCrates, eq(schema.skinCrates.skinId, schema.skins.id))
        .where(and(eq(schema.skinCrates.crateId, FEATURED_CRATE_ID), not(eq(schema.skins.categoryName, 'Knives')))),
      db
        .select(skinSelect)
        .from(schema.skins)
        .leftJoin(schema.rarities, eq(schema.skins.rarityId, schema.rarities.id))
        .where(
          and(
            inArray(schema.skins.rarityId, ['rarity_ancient_weapon', 'rarity_contraband_weapon']),
            isNotNull(schema.skins.image)
          )
        )
        .limit(8),
    ])

    const crate = crateResponse[0] ?? null
    const addDetails = (s: (typeof skinsResponse)[0]): SkinWithDetails => ({
      ...s,
      collectionName: null,
      collectionSlug: null,
    })
    const skins = skinsResponse
      .map(addDetails)
      .sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))
    const popularSkins = popularSkinsResponse.map(addDetails)

    return { crate, skins, collection: crate, collectionSkins: skins, popularSkins }
  } catch {
    return { crate: null, skins: [], collection: null, collectionSkins: [], popularSkins: [] }
  }
}

export default async function Page() {
  const { crate, skins, collection, collectionSkins, popularSkins } = await getData()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'CS2 Skins DB | Browse All Counter-Strike 2 Skins',
    description:
      'Explore CS2 Skins DB, your ultimate resource for all Counter-Strike 2 skins, cases, collections, gloves, and more. Stay updated with the latest in-game items and market prices.',
    url: 'https://cs2skinsdb.com/',
    mainEntity: [
      {
        '@type': 'ItemList',
        name: 'Latest CS2 Case',
        itemListElement: crate
          ? [
              {
                '@type': 'Product',
                name: crate.name,
                description: crate.description || 'Discover the latest CS2 case and its contents.',
                image: crate.image,
                offers: {
                  '@type': 'AggregateOffer',
                  lowPrice: 'N/A',
                  highPrice: 'N/A',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  seller: { '@type': 'Organization', name: 'Steam Community Market' },
                },
              },
            ]
          : [],
      },
      {
        '@type': 'ItemList',
        name: 'Featured Collections',
        itemListElement: collectionSkins.map((skin) => ({
          '@type': 'Product',
          name: skin.name,
          description: skin.description || `Part of the ${collection?.name} collection.`,
          image: skin.image,
          sku: skin.id,
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: 'N/A',
            highPrice: 'N/A',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'Steam Community Market' },
          },
        })),
      },
      {
        '@type': 'ItemList',
        name: 'Popular CS2 Skins',
        itemListElement: popularSkins.map((skin) => ({
          '@type': 'Product',
          name: skin.name,
          description: `Popular skin for the ${skin.weaponSlug}.`,
          image: skin.image,
          sku: skin.id,
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: 'N/A',
            highPrice: 'N/A',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'Steam Community Market' },
          },
        })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Hero — full-width so glow bleeds to viewport edges */}
      <section className="relative w-full py-14 lg:py-20 overflow-hidden border-b border-[#1a1c2e]">
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-12 w-150 h-150 rounded-full bg-violet-950/60 blur-[120px]" />
          <div className="absolute top-0 right-0 w-90 h-90 rounded-full bg-violet-900/25 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex flex-col gap-6 max-lg:items-center max-lg:text-center lg:max-w-xl">
            <h1>
              <span className="block text-sm font-medium tracking-[0.2em] uppercase text-accent-foreground mb-3">
                The Ultimate CS2 Reference
              </span>
              <span className="block text-5xl md:text-6xl font-mono font-bold bg-linear-to-br from-violet-300 via-violet-500 to-violet-700 bg-clip-text text-transparent leading-[1.1]">
                CS2 Skins DB
              </span>
            </h1>
            <p className="font-light text-secondary-foreground leading-relaxed">
              Your comprehensive database for every Counter-Strike 2 skin, case, collection, and item. Detailed stats,
              rarity tiers, float values, and market data — all in one place.
            </p>
            <Link href="/weapons" className="btn-primary max-w-max" prefetch={false}>
              Browse Skins
            </Link>
          </div>

          <div className="hidden lg:flex w-full max-w-130 shrink-0">
            <Image src={HeroImage} alt="Karambit Black Pearl skin" priority />
          </div>
        </div>
      </section>

      <InternalContainer>
        {/* Latest Case */}
        <section className="w-full py-16">
          <div className="w-full lg:max-w-md space-y-3 border-l-2 border-violet-500 pl-4">
            <h2 className="text-3xl font-medium text-foreground max-sm:text-center">Latest CS2 Case</h2>
            <p className="text-secondary-foreground max-sm:text-center">
              Stay updated with the newest cases in CS2. Find out what&apos;s inside each case, including the latest
              skins and their rarity breakdown.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
            {crate && <CaseCard key={crate.id} crate={crate} index={1} />}
            {skins &&
              skins.length > 0 &&
              skins.slice(0, 3).map((skin, i) => {
                return (
                  <SkinCard key={skin.id} weapon={skin.weaponSlug ?? ''} skin={skin} index={i} useTooltip={false} />
                )
              })}
          </div>
          <div className="flex justify-center items-center gap-3">
            <Link href="/cases" className="btn-primary max-w-max" prefetch={false}>
              Browse All Cases
            </Link>
          </div>
        </section>

        {/* Featured Collection */}
        <section className="w-full py-16 border-t border-[#1a1c2e]">
          <div className="w-full lg:max-w-md space-y-3 border-l-2 border-violet-500 pl-4">
            <h2 className="text-3xl font-medium text-foreground max-sm:text-center">Featured Collection</h2>
            <p className="text-secondary-foreground max-sm:text-center">
              Discover one of the most sought-after collections in Counter-Strike 2 — the Dreams &amp; Nightmares
              Collection.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
            {collection && <CaseCard key={collection.id} crate={collection} />}
            {collectionSkins &&
              collectionSkins.length > 0 &&
              collectionSkins.map((skin) => {
                return <SkinCard key={skin.id} weapon={skin.weaponSlug ?? ''} skin={skin} useTooltip={false} />
              })}
          </div>
          <div className="flex justify-center items-center gap-3">
            <Link href="/collections" className="btn-primary max-w-max" prefetch={false}>
              Browse All Collections
            </Link>
          </div>
        </section>

        {/* Popular Skins */}
        <section className="w-full py-16 border-t border-[#1a1c2e]">
          <div className="w-full lg:max-w-md space-y-3 border-l-2 border-violet-500 pl-4">
            <h2 className="text-3xl font-medium text-foreground max-sm:text-center">Popular CS2 Skins</h2>
            <p className="text-secondary-foreground max-sm:text-center">
              Browse the most coveted skins in Counter-Strike 2. Detailed stats, float ranges, StatTrak availability,
              and which cases they drop from.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            {popularSkins &&
              popularSkins.length > 0 &&
              popularSkins.map((skin) => {
                return <SkinCard key={skin.id} weapon={skin.weaponSlug ?? ''} skin={skin} />
              })}
          </div>
        </section>
      </InternalContainer>
    </>
  )
}
