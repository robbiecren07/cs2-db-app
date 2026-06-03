'use cache'

import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { rarityOrder } from '@/lib/helpers'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import GlobalMarketTable from '@/components/GlobalMarketTable'
import { Badge } from '@/components/ui/badge'
import MiniAgentCard from './MiniAgentCard'
import type { AgentWithDetails, RarityId } from '@/types/custom'
import type { Metadata } from 'next'

interface Data {
  item: AgentWithDetails | null
  collectionSkins: AgentWithDetails[]
  collectionName: string | null
}

type Props = {
  params: { slug: string }
}


const agentSelect = {
  id: schema.agents.id,
  name: schema.agents.name,
  slug: schema.agents.slug,
  shortName: schema.agents.shortName,
  subName: schema.agents.subName,
  rarityId: schema.agents.rarityId,
  teamId: schema.agents.teamId,
  description: schema.agents.description,
  marketHashName: schema.agents.marketHashName,
  image: schema.agents.image,
  defIndex: schema.agents.defIndex,
  modelPlayer: schema.agents.modelPlayer,
  rarityName: schema.rarities.name,
  rarityColor: schema.rarities.color,
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const data = await db
    .select(agentSelect)
    .from(schema.agents)
    .leftJoin(schema.rarities, eq(schema.agents.rarityId, schema.rarities.id))
    .where(eq(schema.agents.slug, slug))
    .limit(1)

  if (!data.length) return {}

  return {
    title: `${data[0].name} | CS2 Skin Prices, Stats, and Info`,
    description: `Discover the ${data[0].name} in Counter-Strike 2. Check current Steam market prices, explore collection and case details, and get in-depth information on pattern index, float values, and more for this skin.`,
    alternates: {
      canonical: `/agents/${slug}`,
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
  const agentData = await db
    .select(agentSelect)
    .from(schema.agents)
    .leftJoin(schema.rarities, eq(schema.agents.rarityId, schema.rarities.id))
    .where(eq(schema.agents.slug, slug))
    .limit(1)

  if (!agentData.length) return { item: null, collectionSkins: [], collectionName: null }

  const { getCollectionForAgent } = await import('@/db/queries')
  const collection = await getCollectionForAgent(agentData[0].id)

  let collectionSkins: AgentWithDetails[] = []
  if (collection) {
    const relatedAgents = await db
      .select(agentSelect)
      .from(schema.agents)
      .leftJoin(schema.rarities, eq(schema.agents.rarityId, schema.rarities.id))
      .innerJoin(schema.agentCollections, eq(schema.agentCollections.agentId, schema.agents.id))
      .where(eq(schema.agentCollections.collectionId, collection.collectionId))
      .orderBy(asc(schema.agents.rarityId))

    collectionSkins = relatedAgents
      .map((a) => ({ ...a, collectionName: collection.collectionName, collectionSlug: collection.collectionSlug }))
      .sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))
  }

  const item: AgentWithDetails = {
    ...agentData[0],
    collectionName: collection?.collectionName ?? null,
    collectionSlug: collection?.collectionSlug ?? null,
  }

  return { item, collectionSkins, collectionName: collection?.collectionName ?? null }
}

export default async function SkinPage({ params }: Props) {
  const { slug } = await params
  const { item: data, collectionSkins, collectionName } = await getData(slug)

  if (!data) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active={data.name} parent="Agents" parentHref="/agents" />
      <PageTitle title={data.name} />

      <div className="w-full flex flex-wrap gap-y-10 py-8 lg:py-12">
        <div className="shrink basis-full lg:basis-1/2 px-3 flex flex-col gap-6 h-full max-lg:order-1">
          <div
            style={{ borderTopColor: data.rarityColor ? data.rarityColor : '' }}
            className="w-full bg-muted p-4 space-y-4 rounded-lg border-t-4"
          >
            {data.image && (
              <Image
                alt={`${data.name} skin modal`}
                className="h-96 w-full aspect-video object-contain"
                src={data.image}
                width="512"
                height="384"
                priority
              />
            )}
            <div className="flex flex-wrap gap-2">
              {data.rarityId && <Badge variant={data.rarityId as RarityId}>{data.rarityName}</Badge>}
            </div>
          </div>
        </div>

        <div className="shrink basis-full lg:basis-1/2 px-3 flex flex-col space-y-8 max-lg:order-4 overflow-hidden">
          <div className="w-full space-y-2 px-2">
            <h2 className="text-lg text-center">Steam Community Market Prices</h2>
            <GlobalMarketTable item={data} />
          </div>
          <div className="w-full p-4 bg-muted space-y-3 rounded-lg text-accent-foreground text-sm">
            {data.description && (
              <p>
                <span className="font-medium text-secondary-foreground">Description:</span>{' '}
                {data.description.split('\\n')[0]}
              </p>
            )}
          </div>
        </div>

        {collectionSkins && (
          <div className="shrink basis-full self-stretch flex flex-col gap-4 px-3 pt-6 lg:pt-10 max-lg:order-5">
            <h2 className="text-2xl font-medium pt-4">{collectionName}</h2>
            <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {collectionSkins.map((skin) => (
                <MiniAgentCard key={skin.id} agent={skin} />
              ))}
            </div>
          </div>
        )}
      </div>
    </InternalContainer>
  )
}
