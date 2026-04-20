'use cache'

import { neon } from '@neondatabase/serverless'
import { notFound } from 'next/navigation'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import Image from 'next/image'
import FloatBar from '@/components/FloatBar'
import MarketTable from '@/components/MarketTable'
import GlobalCaseCard from '@/components/GlobalCaseCard'
import MiniGloveCard from './MiniGloveCard'
import type { Case, Gloves } from '@/types/custom'
import type { Metadata } from 'next'

interface Data {
  glove: Gloves | null
  collectionGloves: Gloves[]
}

type Props = {
  params: { glove: string }
}

export async function generateStaticParams() {
  const sql = neon(process.env.DATABASE_URL!)
  const data = (await sql`SELECT * FROM gloves ORDER BY name ASC`) as Gloves[]

  if (!data || data.length === 0) {
    return []
  }

  return data.map((glove) => ({
    glove: glove.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { glove } = await params

  const sql = neon(process.env.DATABASE_URL!)
  const data = (await sql`SELECT * FROM gloves WHERE slug = ${glove} LIMIT 1`) as Gloves[]

  if (!data) {
    return {}
  }

  return {
    title: `${data[0].name} | CS2 Gloves | Counter-Strike 2 Skin`,
    description: `Discover the ${data[0].name} in Counter-Strike 2. Explore detailed information about this unique glove, including design, prices, and rarity. Enhance your gameplay with the exclusive ${data[0].name}`,
    alternates: {
      canonical: `/gloves/${glove}`,
    },
    openGraph: {
      images: [
        {
          url: data[0].image,
          width: 512,
          height: 384,
          alt: `${data[0].name} skin modal`,
        },
      ],
    },
  }
}

async function getData(glove: string): Promise<Data> {
  const sql = neon(process.env.DATABASE_URL!)
  const data = (await sql`SELECT * FROM gloves WHERE slug = ${glove} LIMIT 1`) as Gloves[]

  if (!data || data.length === 0) {
    return { glove: null, collectionGloves: [] }
  }

  const collectionGloves =
    await sql`SELECT * FROM gloves WHERE weapon_id_ref = ${data[0].weapon_id_ref} ORDER BY name ASC`

  if (!collectionGloves || collectionGloves.length === 0) {
    return { glove: data[0] as Gloves, collectionGloves: [] }
  }

  return { glove: data[0] as Gloves, collectionGloves: collectionGloves as Gloves[] }
}

export default async function GlovePage({ params }: { params: { glove: string } }) {
  const { glove } = await params
  const { glove: data, collectionGloves } = await getData(glove)

  if (!data) {
    return notFound()
  }

  const in_cases: Case[] = typeof data.in_cases === 'string' ? JSON.parse(data.in_cases) : data.in_cases

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${data.name} Gloves`,
    description: data.description
      ? data.description.split('\\n')[0]
      : `Explore the ${data.name} gloves in Counter-Strike 2. Discover their unique design, prices, and rarity.`,
    image: data.image,
    url: `https://cs2skinsdb.com/gloves/${data.slug}`,
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
        name: 'Float Value',
        value: `${data.min_float} - ${data.max_float}`,
      },
    ],
    isRelatedTo: collectionGloves.map((glove) => ({
      '@type': 'Product',
      name: glove.name,
      description: `A related glove from the same collection as ${data.name}.`,
      image: glove.image,
      url: `https://cs2skinsdb.com/gloves/${glove.slug}`,
    })),
  }

  return (
    <InternalContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <BreadCrumbBar active={data.name.replace('★ ', '')} parent="Gloves" parentHref="/gloves" />
      <PageTitle title={data.name} />

      <div className="w-full flex flex-wrap gap-y-10 py-8 lg:py-12">
        <div className="shrink basis-full lg:basis-1/2 px-3 flex flex-col gap-6 h-full max-lg:order-1">
          <div className="w-full bg-muted p-4 space-y-4 rounded-lg border-t-4 border-t-[#eb4b4b]">
            {data.image && (
              <Image
                alt={`${data.name} skin modal`}
                className="h-48 md:h-96 w-full mx-auto aspect-video object-contain max-sm:object-right"
                src={data.image}
                width="512"
                height="384"
                priority
              />
            )}
          </div>
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

          <FloatBar minFloat={data.min_float} maxFloat={data.max_float} />
        </div>

        <div className="shrink basis-full lg:basis-1/2 self-stretch px-3 max-lg:order-3">
          {in_cases.length ? (
            <div className="w-full flex flex-wrap justify-center p-4 bg-muted rounded-lg">
              {in_cases.length && <GlobalCaseCard item={{ in_cases }} />}
            </div>
          ) : null}
        </div>

        <div className="shrink basis-full self-stretch lg:basis-1/2 px-3 max-lg:order-2">
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

        {collectionGloves && (
          <div className="shrink basis-full self-stretch flex flex-col gap-4 px-3 pt-6 lg:pt-10 max-lg:order-5">
            <h2 className="text-2xl font-medium pt-4">{data.weapon_name}</h2>
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3">
              {collectionGloves.map((item) => (
                <MiniGloveCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </InternalContainer>
  )
}
