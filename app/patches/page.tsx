import { Patches } from '@/types/custom'
import { createClient } from '@/utils/supabase/client'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { rarityOrder } from '@/lib/helpers'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import IntroParagraph from '@/components/IntroParagraph'
import ItemCard from './ItemCard'

export const metadata: Metadata = {
  title: 'CS2 Agent Patches | Browse All Counter-Strike 2 Patches',
  description: `Explore all Agent Patches in Counter-Strike 2. Discover detailed information about each patch, including unique designs, market prices, and rarity.`,
  alternates: {
    canonical: '/patches',
  },
}

async function getData(): Promise<Patches[] | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('patches').select('*').order('name', { ascending: true })

  if (error) {
    return null
  }

  return data.sort((a, b) => (rarityOrder[a.rarity_id] || 999) - (rarityOrder[b.rarity_id] || 999))
}

export default async function PatchesPage() {
  const data = await getData()

  if (!data) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active="Patches" />
      <PageTitle title="All CS2 Agent Patches" />

      <IntroParagraph content="Welcome to the Agent Patches section of CS2 Skins DB. Here, you can explore a comprehensive collection of patches available for agents in Counter-Strike 2. Each patch offers a unique design, allowing you to customize your agents and add a personal touch to your gameplay. Whether you're looking for rare patches to complete your collection or want to stay updated with the latest additions, our detailed database provides all the information you need. Dive into the world of CS2 Agent Patches and discover the perfect customizations to enhance your gaming experience." />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 lg:py-12">
        {data.map((item, index) => {
          return <ItemCard key={item.id} item={item} index={index} />
        })}
      </div>
    </InternalContainer>
  )
}
