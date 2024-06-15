import { Agents } from '@/types/custom'
import { createClient } from '@/utils/supabase/client'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { rarityOrder } from '@/lib/helpers'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import IntroParagraph from '@/components/IntroParagraph'
import { AgentsCard } from './AgentsCard'

export const metadata: Metadata = {
  title: 'CS2 Agents Skins | Browse All Counter-Strike 2 Agents',
  description: `Explore all Agent Skins in Counter-Strike 2. Discover detailed information about each agent, including unique designs, market prices, and rarity. Stay updated with the latest agent skins and enhance your gaming experience with exclusive characters.`,
  alternates: {
    canonical: '/agents',
  },
}

async function getData(): Promise<Agents[] | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('agents').select('*').order('name', { ascending: true })

  if (error) {
    return null
  }

  return data.sort((a, b) => (rarityOrder[a.rarity_id] || 999) - (rarityOrder[b.rarity_id] || 999))
}

export default async function AgentsPage() {
  const data = await getData()

  if (!data) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active="Agents" />
      <PageTitle title="All CS2 Agent Skins" />

      <IntroParagraph content="Welcome to the Agent Skins section of CS2 Skins DB. This is your go-to resource for exploring all the unique agent skins available in Counter-Strike 2. Each agent skin brings a distinctive look and personality to the game, allowing you to stand out on the battlefield. Whether you're seeking to add rare characters to your collection or just want to see the latest additions, our detailed database provides all the information you need. Dive into the world of CS2 Agent Skins and discover the perfect characters to enhance your gameplay." />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 lg:py-12">
        {data.map((item, index) => {
          return <AgentsCard key={item.id} item={item} index={index} />
        })}
      </div>
    </InternalContainer>
  )
}
