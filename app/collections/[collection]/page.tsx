import { Collections, Skins } from '@/types/custom'
import { createClient } from '@/utils/supabase/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import PageTitle from '@/components/PageTitle'
import InternalContainer from '@/components/InternalContainer'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import { SkinCard } from '@/components/SkinCard'
import IntroParagraph from '@/components/IntroParagraph'
import { rarityOrder } from '@/lib/helpers'

interface Data {
  data: Collections | null
  skins: Skins[]
}

type Props = {
  params: { collection: string }
}

export const revalidate = 3600

export async function generateStaticParams() {
  const supabase = createClient()
  const { data, error } = await supabase.from('collections').select('slug')

  if (error) {
    return []
  }

  return data.map((post) => ({
    collection: post.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = params.collection
  const supabase = createClient()
  const { data } = await supabase.from('collections').select('*').eq('slug', collection).single()

  if (!data) {
    return {}
  }

  return {
    title: `${data.name} | CS2 Collection | Counter-Strike 2 Skins`,
    description: `Discover the ${data.name} in Counter-Strike 2. Browse through the unique weapon skins, find detailed information on prices and rarity, and stay updated with the latest additions to the collection.`,
    alternates: {
      canonical: `/collections/${collection}`,
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

async function getData(collection: string): Promise<Data> {
  const supabase = createClient()
  try {
    const [collectionsResponse, skinsResponse] = await Promise.all([
      supabase.from('collections').select('*').eq('slug', collection).single(),
      supabase.from('skins').select('*').eq('collections_slug', collection),
    ])

    const data = collectionsResponse.data
    const skins = skinsResponse.data || []

    return {
      data,
      skins,
    }
  } catch (error) {
    return { data: null, skins: [] }
  }
}

export default async function CollectionPage({ params }: Props) {
  const { collection } = params
  const { data, skins } = await getData(collection)

  if (!data || !skins) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active={data.name} parent="Collections" parentHref="/collections" />
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
              <SkinCard key={skin.id} weapon={skin.weapon_slug} skin={skin} index={i}>
                <h2 className="sr-only">{skin.weapon_name}</h2>
              </SkinCard>
            )
          })}
        </div>
      </div>
    </InternalContainer>
  )
}
