'use cache'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import { Badge } from '@/components/ui/badge'
import GlobalMarketTable from '@/components/GlobalMarketTable'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { PatchWithRarity, RarityId } from '@/types/custom'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await db
    .select({
      id: schema.patches.id,
      name: schema.patches.name,
      image: schema.patches.image,
    })
    .from(schema.patches)
    .where(eq(schema.patches.slug, slug))
    .limit(1)

  if (!data.length) return {}

  return {
    title: `${data[0].name} | CS2 Skins DB`,
    description: `Discover the ${data[0].name} in Counter-Strike 2. Check current Steam market prices, explore patch details, and more for this patch.`,
    alternates: {
      canonical: `/patches/${slug}`,
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

async function getData(slug: string): Promise<PatchWithRarity | null> {
  const data = await db
    .select({
      id: schema.patches.id,
      name: schema.patches.name,
      slug: schema.patches.slug,
      shortName: schema.patches.shortName,
      rarityId: schema.patches.rarityId,
      description: schema.patches.description,
      marketHashName: schema.patches.marketHashName,
      image: schema.patches.image,
      defIndex: schema.patches.defIndex,
      rarityName: schema.rarities.name,
      rarityColor: schema.rarities.color,
    })
    .from(schema.patches)
    .leftJoin(schema.rarities, eq(schema.patches.rarityId, schema.rarities.id))
    .where(eq(schema.patches.slug, slug))
    .limit(1)
  return data[0] ?? null
}

export default async function SkinPage({ params }: Props) {
  const { slug } = await params
  const data = await getData(slug)

  if (!data) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active={data.name} parent="Patches" parentHref="/patches" />
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
                className="h-48 md:h-96 w-full aspect-video object-contain"
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
                {data.description.split('<br>')[0]}
              </p>
            )}
          </div>
        </div>
      </div>
    </InternalContainer>
  )
}
