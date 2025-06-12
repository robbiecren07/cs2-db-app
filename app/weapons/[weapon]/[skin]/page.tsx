import { Collections, Skins, Case } from '@/types/custom'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import FloatBar from '@/components/FloatBar'
import GlobalCollectionCard from '@/components/GlobalCollectionCard'
import GlobalCaseCard from '@/components/GlobalCaseCard'
import MiniSkinCard from './MiniSkinCard'
import MainCard from './MainCard'
import MarketTable from './MarketTable'
import { rarityOrder } from '@/lib/helpers'
import Image from 'next/image'

interface Data {
  skin: Skins | null
  collection: Collections | null
  collectionSkins: Skins[]
}

type Props = {
  params: { weapon: string; skin: string }
}

export async function generateStaticParams() {
  const supabase = createClient()
  const { data, error } = await supabase.from('skins').select('weapon_slug, short_slug')

  if (error || !data) return []

  return data.map((item) => ({
    weapon: item.weapon_slug,
    skin: item.short_slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const weapon = params.weapon
  const skin = params.skin
  const supabase = createClient()
  const { data } = await supabase.from('skins').select('*').eq('weapon_slug', weapon).eq('short_slug', skin).single()

  if (!data) {
    return {}
  }

  return {
    title: `${data.name} | CS2 Skin Prices, Stats, and Info`,
    description: `Discover the ${data.name} in Counter-Strike 2. Check current Steam market prices, explore collection and case details, and get in-depth information on pattern index, float values, and more for this skin.`,
    alternates: {
      canonical: `/weapons/${weapon}/${skin}`,
    },
    openGraph: {
      images: [
        {
          url: data.image,
          width: 512,
          height: 384,
          alt: `${data.name} skin modal`,
        },
      ],
    },
  }
}

async function getData(weapon: string, skin: string): Promise<Data> {
  const supabase = createClient()

  const { data: skinData, error: skinError } = await supabase
    .from('skins')
    .select('*')
    .eq('weapon_slug', weapon)
    .eq('short_slug', skin)
    .single()

  if (skinError || !skinData) {
    return { skin: null, collection: null, collectionSkins: [] }
  }

  const { data: collectionsData, error: collectionsDataError } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', skinData.collections_slug)
    .single()

  const { data: collectionSkinsData, error: collectionSkinsError } = await supabase
    .from('skins')
    .select('*')
    .eq('collections_slug', skinData.collections_slug)
    .order('rarity_id', { ascending: true })

  return {
    skin: skinData,
    collection: collectionsDataError ? null : collectionsData,
    collectionSkins: collectionSkinsError
      ? []
      : collectionSkinsData.sort((a, b) => (rarityOrder[a.rarity_id] || 999) - (rarityOrder[b.rarity_id] || 999)) || [],
  }
}

export default async function SkinPage({ params }: Props) {
  const { weapon, skin } = params
  const { skin: data, collection, collectionSkins } = await getData(weapon, skin)

  if (!data) {
    return notFound()
  }

  const in_cases: Case[] = typeof data.in_cases === 'string' ? JSON.parse(data.in_cases) : data.in_cases

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description
      ? data.description.split('\\n')[0]
      : `Discover the ${data.name} skin for ${data.weapon_name} in Counter-Strike 2.`,
    image: data.image, // Replace with the actual skin image URL
    url: `https://cs2skinsdb.com/weapons/${weapon}/${data.short_slug}`,
    brand: {
      '@type': 'Thing',
      name: 'Counter-Strike 2',
    },
    sku: data.paint_index,
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
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Rarity',
        value: data.rarity_name,
      },
      {
        '@type': 'PropertyValue',
        name: 'Weapon',
        value: data.weapon_name,
      },
      {
        '@type': 'PropertyValue',
        name: 'Float Value',
        value: `${data.min_float} - ${data.max_float}`,
      },
    ],
  }

  return (
    <InternalContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <BreadCrumbBar
        active={data.short_name ? data.short_name : data.name}
        parent={data.weapon_name.replace('★ ', '')}
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
              ring-offset-background transition-colors bg-foreground text-background hover:bg-secondary-foreground focus-visible:outline-none 
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
              ring-offset-background transition-colors bg-foreground text-background hover:bg-secondary-foreground focus-visible:outline-none 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              target="_blank"
              rel="nofollow"
            >
              Buy on
              <Image width={27} height={24} src="/dm-ua-logo.png" alt="DMARKET logo" unoptimized />
              DMARKET
            </a>
          </div>

          <FloatBar minFloat={data.min_float} maxFloat={data.max_float} />
        </div>

        <div className="shrink basis-full lg:basis-1/2 self-stretch px-3 max-lg:order-3">
          {collection || in_cases ? (
            <div className="w-full flex flex-wrap justify-center p-4 bg-muted rounded-lg">
              {collection && <GlobalCollectionCard collection={collection} />}
              {in_cases && in_cases.length && <GlobalCaseCard item={{ in_cases }} />}
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
            {data.paint_index && (
              <p>
                <span className="font-medium text-secondary-foreground">Finish Catalog:</span> {data.paint_index}
              </p>
            )}
          </div>
        </div>

        {collection && collectionSkins && (
          <div className="shrink basis-full self-stretch flex flex-col gap-4 px-3 pt-6 lg:pt-10 max-lg:order-5">
            <h2 className="text-2xl font-medium pt-4">{collection.name}</h2>
            <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {collectionSkins.map((skin) => (
                <MiniSkinCard key={skin.id} weapon={skin.weapon_slug} skin={skin} />
              ))}
            </div>
          </div>
        )}
      </div>
    </InternalContainer>
  )
}
