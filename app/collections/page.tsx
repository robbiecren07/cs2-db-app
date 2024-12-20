import { Collections } from '@/types/custom'
import { createClient } from '@/utils/supabase/client'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import IntroParagraph from '@/components/IntroParagraph'
import { CollectionsCard } from './CollectionsCard'

export const metadata: Metadata = {
  title: 'CS2 Collections | Browse All Counter-Strike 2 Collections',
  description: `Explore all CS2 Collections in Counter-Strike 2. Discover detailed information on each collection's unique weapon skins, prices, and rarity. Stay updated with the latest and most coveted collections in the game.`,
  alternates: {
    canonical: '/collections',
  },
}

export const revalidate = 3600

async function getData(): Promise<Collections[] | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('collections').select('*').order('name', { ascending: true })

  if (error) {
    return null
  }

  return data
}

export default async function CollectionsPage() {
  const data = await getData()

  if (!data) {
    return notFound()
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CS2 Collections | Browse All Counter-Strike 2 Collections',
    description:
      "Explore all CS2 Collections in Counter-Strike 2. Discover detailed information on each collection's unique weapon skins, prices, and rarity. Stay updated with the latest and most coveted collections in the game.",
    url: 'https://cs2skinsdb.com/collections',
    itemListElement: data.map((collection, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: collection.name,
      description: `Discover skins and items from the ${collection.name} collection.`,
      image: collection.image,
      url: `https://cs2skinsdb.com/collections/${collection.slug}`,
    })),
  }

  return (
    <InternalContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <BreadCrumbBar active="Collections" />
      <PageTitle title="All CS2 Collections" />

      <IntroParagraph content="Welcome to the CS2 Collections page, your comprehensive guide to all the unique weapon collections in Counter-Strike 2. Here, you'll find detailed information on each collection, including the most coveted and rarest skins. Whether you're a seasoned player or new to the game, our database provides everything you need to know about the latest and most iconic collections. Dive in and discover the perfect skins to enhance your gameplay and showcase your style." />

      <div className="w-full grid gap-4 py-8 lg:py-12">
        <h2 className="text-3xl font-medium text-accent-foreground max-sm:text-center">Latest Collections</h2>
        <div className="w-full grid grid-cols-card gap-6">
          {data.map((collection, index) => {
            return collection.featured && <CollectionsCard key={collection.id} collection={collection} index={index} />
          })}
        </div>
      </div>

      <div className="w-full grid gap-4 py-8 lg:py-12">
        <h2 className="text-3xl font-medium text-accent-foreground max-sm:text-center">All Collections</h2>
        <div className="w-full grid grid-cols-card gap-6">
          {data.map((collection, index) => {
            return <CollectionsCard key={collection.id} collection={collection} index={index} />
          })}
        </div>
      </div>
    </InternalContainer>
  )
}
