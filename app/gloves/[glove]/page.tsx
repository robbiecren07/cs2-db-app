import { Case, Gloves } from '@/types/custom'
import { createClient } from '@/utils/supabase/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import Image from 'next/image'
import FloatBar from '@/components/FloatBar'
import MarketTable from '@/components/MarketTable'
import GlobalCaseCard from '@/components/GlobalCaseCard'
import MiniGloveCard from './MiniGloveCard'

interface Data {
  glove: Gloves | null
  collectionGloves: Gloves[]
}

type Props = {
  params: { glove: string }
}

export async function generateStaticParams() {
  const supabase = createClient()
  const { data, error } = await supabase.from('gloves').select('*')

  if (error) {
    return []
  }

  return data.map((glove) => ({
    glove: glove.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.glove
  const supabase = createClient()
  const { data } = await supabase.from('gloves').select('*').eq('slug', slug).single()

  if (!data) {
    return {}
  }

  return {
    title: `${data.name} | CS2 Gloves | Counter-Strike 2 Skin`,
    description: `Discover the ${data.name} in Counter-Strike 2. Explore detailed information about this unique glove, including design, prices, and rarity. Enhance your gameplay with the exclusive ${data.name}`,
    alternates: {
      canonical: `/gloves/${slug}`,
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

async function getData(glove: string): Promise<Data> {
  const supabase = createClient()
  const { data: gloveData, error } = await supabase.from('gloves').select('*').eq('slug', glove).single()

  if (error) {
    return { glove: null, collectionGloves: [] }
  }

  const { data: collectionGloves, error: collectionError } = await supabase
    .from('gloves')
    .select('*')
    .eq('weapon_id_ref', gloveData.weapon_id_ref)
    .order('name', { ascending: true })

  if (collectionError) {
    return { glove: gloveData, collectionGloves: [] }
  }

  return { glove: gloveData, collectionGloves }
}

export default async function GlovePage({ params }: { params: { glove: string } }) {
  const { glove } = params
  const { glove: data, collectionGloves } = await getData(glove)

  if (!data) {
    return notFound()
  }

  const in_cases: Case[] = typeof data.in_cases === 'string' ? JSON.parse(data.in_cases) : data.in_cases

  return (
    <InternalContainer>
      <BreadCrumbBar active={data.name.replace('★ ', '')} parent="Gloves" parentHref="/gloves" />
      <PageTitle title={data.name} />

      <div className="w-full flex flex-wrap gap-y-10 py-8 lg:py-12">
        <div className="shrink basis-full lg:basis-1/2 px-3 flex flex-col gap-6 h-full max-lg:order-1">
          <div className="w-full bg-muted p-4 space-y-4 rounded-lg border-t-4 border-t-[#eb4b4b]">
            {data.image && (
              <Image
                alt={`${data.name} skin modal`}
                className="h-[192px] md:h-[384px] w-full mx-auto aspect-video object-contain max-sm:object-right"
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
