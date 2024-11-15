import { Crates, Skins } from '@/types/custom'
import { createClient } from '@/utils/supabase/client'
import InternalContainer from '@/components/InternalContainer'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import HeroImage from '@/public/hero_image.png'
import { rarityOrder } from '@/lib/helpers'
import { SkinCard } from '@/components/SkinCard'
import { CaseCard } from '@/components/CaseCard'

interface Data {
  crate: Crates | null
  skins: Skins[]
  collection: Crates | null
  collectionSkins: Skins[]
  popularSkins: Skins[]
}

export const metadata: Metadata = {
  title: 'CS2 Skins DB | Browse All Counter-Strike 2 Skins',
  description: `Explore CS2 Skins DB, your ultimate resource for all Counter-Strike 2 skins, cases, collections, gloves, and more. Stay updated with the latest in-game items, market prices.`,
  alternates: {
    canonical: '/',
  },
}

export const revalidate = 3600

async function getData(): Promise<Data> {
  const supabase = createClient()
  try {
    const [crateResponse, skinsResponse, collectionResponse, collectionSkinsResponse, popularSkinsResponse] =
      await Promise.all([
        supabase.from('crates').select('*').eq('id', 'crate-4412').single(),
        supabase.from('skins').select('*').contains('case_ids', ['crate-4412']).not('weapon_type', 'in', '(Knives)'),
        supabase.from('crates').select('*').eq('id', 'crate-4001').single(),
        supabase.from('skins').select('*').contains('case_ids', ['crate-4001']).not('weapon_type', 'in', '(Knives)'),
        supabase.from('skins').select('*').eq('featured', true),
      ])

    const crate = crateResponse.data
    const skins = skinsResponse.data || []
    const collection = collectionResponse.data
    const collectionSkins = collectionSkinsResponse.data || []
    const popularSkins = popularSkinsResponse.data || []

    return {
      crate,
      skins: skins.sort((a, b) => (rarityOrder[a.rarity_id] || 999) - (rarityOrder[b.rarity_id] || 999)),
      collection,
      collectionSkins: collectionSkins.sort(
        (a, b) => (rarityOrder[a.rarity_id] || 999) - (rarityOrder[b.rarity_id] || 999)
      ),
      popularSkins,
    }
  } catch (error) {
    return { crate: null, skins: [], collection: null, collectionSkins: [], popularSkins: [] }
  }
}

export default async function Index() {
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
                  seller: {
                    '@type': 'Organization',
                    name: 'Steam Community Market',
                  },
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
            seller: {
              '@type': 'Organization',
              name: 'Steam Community Market',
            },
          },
        })),
      },
      {
        '@type': 'ItemList',
        name: 'Popular CS2 Skins',
        itemListElement: popularSkins.map((skin) => ({
          '@type': 'Product',
          name: skin.name,
          description: `Popular skin for the ${skin.weapon_slug}.`,
          image: skin.image,
          sku: skin.id,
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: 'N/A',
            highPrice: 'N/A',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'Organization',
              name: 'Steam Community Market',
            },
          },
        })),
      },
    ],
  }

  return (
    <InternalContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="relative w-full min-h-[40dvh] lg:min-h-[50dvh] flex justify-center items-center gap-6 pt-8">
        <div className="flex-1 flex flex-col gap-8">
          <h1 className="text-2xl md:text-4xl font-medium text-accent-foreground max-sm:text-center">
            Welcome to{' '}
            <span className="text-4xl md:text-5xl block font-mono text-purple-600 font-bold">CS2 Skins DB</span>
          </h1>
          <p className="xl:max-w-xl font-light max-sm:text-center">
            The the ultimate destination for Counter-Strike 2 enthusiasts. Our comprehensive database offers detailed
            information on all skins, cases, collections, and more, helping you stay ahead in the game. Whether
            you&lsquo;re a seasoned player or new to the world of CS2, our platform provides everything you need to
            enhance your gaming experience.
          </p>
          <Link
            href="/weapons"
            className="max-w-max h-11 rounded-md px-8 max-sm:mx-auto inline-flex items-center justify-center whitespace-nowrap bg-purple-700 transition-colors hover:bg-purple-800"
          >
            Browse Skins
          </Link>
        </div>

        <div className="max-lg:hidden w-full max-w-[512px] flex">
          <Image src={HeroImage} alt="Karambit Black Blackpearl skin modal" priority />
        </div>
      </section>

      <section className="w-full py-16">
        <div className="w-full lg:max-w-md space-y-3">
          <h2 className="text-3xl font-medium text-accent-foreground max-sm:text-center">Latest CS2 Case</h2>
          <p className="max-sm:text-center">
            Stay updated with the newest cases in CS2. Find out what&lsquo;s inside each case, including the latest
            skins and their market prices.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
          {crate && <CaseCard key={crate.id} crate={crate} index={1} />}
          {skins &&
            skins.length > 0 &&
            skins.slice(0, 3).map((skin, i) => {
              return <SkinCard key={skin.id} weapon={skin.weapon_slug} skin={skin} index={i} useTooltip={false} />
            })}
        </div>
        <div className="flex justify-center items-center gap-3">
          <Link
            href="/cases"
            className="max-w-max h-11 rounded-md px-8 inline-flex items-center justify-center whitespace-nowrap bg-purple-700 transition-colors hover:bg-purple-800"
          >
            Browse All Cases
          </Link>
        </div>
      </section>

      <section className="w-full py-16">
        <div className="w-full lg:max-w-md space-y-3">
          <h2 className="text-2xl font-medium text-accent-foreground max-sm:text-center">Featured Collections</h2>
          <p className="max-sm:text-center">
            Discover one of the most sought-after collections in Counter-Strike 2, the The Dreams & Nightmares
            Collection.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
          {collection && <CaseCard key={collection.id} crate={collection} />}
          {collectionSkins &&
            collectionSkins.length > 0 &&
            collectionSkins.map((skin) => {
              return <SkinCard key={skin.id} weapon={skin.weapon_slug} skin={skin} useTooltip={false} />
            })}
        </div>
        <div className="flex justify-center items-center gap-3">
          <Link
            href="/collections"
            className="max-w-max h-11 rounded-md px-8 inline-flex items-center justify-center whitespace-nowrap bg-purple-700 transition-colors hover:bg-purple-800"
          >
            Browse All Collections
          </Link>
        </div>
      </section>

      <section className="w-full py-16">
        <div className="w-full lg:max-w-md space-y-3">
          <h2 className="text-2xl font-medium text-accent-foreground max-sm:text-center">Popular CS2 Skins</h2>
          <p className="max-sm:text-center">
            Browse through the most popular skins in Counter-Strike 2. See detailed stats, market prices, and find out
            which cases they come from.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {popularSkins &&
            popularSkins.length > 0 &&
            popularSkins.map((skin) => {
              return <SkinCard key={skin.id} weapon={skin.weapon_slug} skin={skin} />
            })}
        </div>
      </section>
    </InternalContainer>
  )
}
