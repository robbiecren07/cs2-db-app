import { Collectables, RarityId } from '@/types/custom'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import { Badge } from '@/components/ui/badge'
import GlobalMarketTable from '@/components/GlobalMarketTable'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug
  const supabase = createClient()
  const { data } = await supabase.from('collectables').select('*').eq('slug', slug).single()

  if (!data) {
    return {}
  }

  return {
    title: `${data.name} | CS2 Skins DB`,
    description: `Discover the ${data.name} in Counter-Strike 2. Check current Steam market prices, explore pin details, get in-depth information and more for this pin.`,
    alternates: {
      canonical: `/pins/${slug}`,
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

async function getData(slug: string): Promise<Collectables | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from('collectables').select('*').eq('slug', slug).single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function SkinPage({ params }: Props) {
  const { slug } = params
  const data = await getData(slug)

  if (!data) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active={data.name} parent="Pins" parentHref="/pins" />
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
                className="h-[192px] md:h-[384px] w-full aspect-video object-contain"
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
                {data.description.split('<br>')[0]}
              </p>
            )}
          </div>
        </div>
      </div>
    </InternalContainer>
  )
}
