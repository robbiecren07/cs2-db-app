import { Agents, RarityId } from '@/types/custom'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { rarityOrder } from '@/lib/helpers'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import GlobalMarketTable from '@/components/GlobalMarketTable'
import { Badge } from '@/components/ui/badge'
import MiniAgentCard from './MiniAgentCard'

interface Data {
  item: Agents | null
  collectionSkins: Agents[]
}

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug
  const supabase = createClient()
  const { data } = await supabase.from('agents').select('*').eq('slug', slug).single()

  if (!data) {
    return {}
  }

  return {
    title: `${data.name} | CS2 Skin Prices, Stats, and Info`,
    description: `Discover the ${data.name} in Counter-Strike 2. Check current Steam market prices, explore collection and case details, and get in-depth information on pattern index, float values, and more for this skin.`,
    alternates: {
      canonical: `/agents/${slug}`,
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

async function getData(slug: string): Promise<Data> {
  const supabase = createClient()

  const { data: agentData, error: agentError } = await supabase.from('agents').select('*').eq('slug', slug).single()

  if (agentError || !agentData) {
    return { item: null, collectionSkins: [] }
  }

  const { data: collectionSkinsData, error: collectionSkinsError } = await supabase
    .from('agents')
    .select('*')
    .eq('collections_slug', agentData.collections_slug)
    .order('rarity_id', { ascending: true })

  return {
    item: agentData,
    collectionSkins: collectionSkinsError
      ? []
      : collectionSkinsData.sort((a, b) => (rarityOrder[a.rarity_id] || 999) - (rarityOrder[b.rarity_id] || 999)) || [],
  }
}

export default async function SkinPage({ params }: Props) {
  const { slug } = params
  const { item: data, collectionSkins } = await getData(slug)

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
            style={{ borderTopColor: data.rarity_color ? data.rarity_color : '' }}
            className="w-full bg-muted p-4 space-y-4 rounded-lg border-t-4"
          >
            {data.image && (
              <Image
                alt={`${data.name} skin modal`}
                className="h-[384px] w-full aspect-video object-contain"
                src={data.image}
                width="512"
                height="384"
                priority
              />
            )}
            <div className="flex flex-wrap gap-2">
              {data.rarity_id && <Badge variant={data.rarity_id as RarityId}>{data.rarity_name}</Badge>}
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
            <h2 className="text-2xl font-medium pt-4">{data.collections_name}</h2>
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