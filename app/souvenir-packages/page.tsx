'use cache'

import { neon } from '@neondatabase/serverless'
import { notFound } from 'next/navigation'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import IntroParagraph from '@/components/IntroParagraph'
import { PackagesCard } from './PackagesCard'
import type { SouvenirPackages } from '@/types/custom'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CS2 Souvenir Packages | Browse All CS2 Souvenir Packages',
  description: `Explore all CS2 Souvenir Packages in Counter-Strike 2. Discover detailed information on each collection's unique weapon skins, prices, and rarity. Stay updated with the latest and most coveted collections in the game.`,
  alternates: {
    canonical: '/souvenir-packages',
  },
}

async function getData(): Promise<SouvenirPackages[] | null> {
  const sql = neon(process.env.DATABASE_URL!)
  const data = await sql`SELECT * FROM souvenir_packages ORDER BY name ASC`

  if (!data) {
    return null
  }

  return data as SouvenirPackages[]
}

export default async function PackagesPage() {
  const data = await getData()

  if (!data) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active="Souvenir Packages" />
      <PageTitle title="All CS2 Souvenir Packages" />

      <IntroParagraph content="Welcome to the Souvenir Packages section of CS2 Skins DB. Here, you can explore a comprehensive collection of Souvenir Packages from Counter-Strike 2. Each package contains unique skins that commemorate various in-game events and tournaments. Whether you're looking to enhance your inventory with rare items or simply want to stay updated with the latest additions, our detailed database provides all the information you need. Dive into the world of CS2 Souvenir Packages and discover the perfect additions to your collection." />

      <div className="w-full grid grid-cols-card gap-6 py-8 lg:py-12">
        {data.map((item, index) => {
          return <PackagesCard key={item.id} item={item} index={index} />
        })}
      </div>
    </InternalContainer>
  )
}
