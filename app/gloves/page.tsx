import { Gloves } from '@/types/custom'
import { createClient } from '@/utils/supabase/client'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageTitle from '@/components/PageTitle'
import InternalContainer from '@/components/InternalContainer'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import IntroParagraph from '@/components/IntroParagraph'
import { GloveCard } from './GloveCard'

export const metadata: Metadata = {
  title: 'All CS2 Gloves | Browse Counter-Strike 2 Gloves Collection',
  description: `Explore all CS2 gloves in Counter-Strike 2. Discover detailed information on each glove's unique design, prices, and rarity. Stay updated with the latest and most coveted gloves in the game.`,
  alternates: {
    canonical: '/gloves',
  },
}

async function getData(): Promise<Gloves[] | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('gloves').select('*').order('name', { ascending: true })

  if (error) {
    return null
  }

  return data
}

export default async function GlovesPage() {
  const data = await getData()

  if (!data || data.length === 0) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active="Gloves" />
      <PageTitle title="All CS2 Gloves" />

      <IntroParagraph content="Welcome to the ultimate collection of CS2 gloves in Counter-Strike 2. Our comprehensive database offers detailed insights into every available glove, showcasing their unique designs, prices, and rarity. Whether you are looking to enhance your in-game style or searching for the rarest finds, this page provides all the information you need. Dive in and explore the latest and most iconic gloves that CS2 has to offer." />

      <div className="w-full grid grid-cols-4 gap-6 py-8 lg:py-12">
        {data.map((glove, i) => {
          return <GloveCard key={glove.id} glove={glove} index={i} />
        })}
      </div>
    </InternalContainer>
  )
}
