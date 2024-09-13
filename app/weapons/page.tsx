import { Weapons } from '@/types/custom'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Metadata } from 'next'
import InternalContainer from '@/components/InternalContainer'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import PageTitle from '@/components/PageTitle'
import { WeaponCard } from './WeaponCard'
import IntroParagraph from '@/components/IntroParagraph'

export const metadata: Metadata = {
  title: 'Browse All CS2 Weapons | Counter-Strike 2 Weapon Types',
  description: `Explore all weapon types in Counter-Strike 2. Discover detailed information and images for each weapon type, including pistols, rifles, SMGs, and more. Stay updated with the latest additions and enhance your gameplay with the best CS2 weapons.`,
  alternates: {
    canonical: '/weapons',
  },
}

export const revalidate = 3600

async function getData(): Promise<Weapons[] | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('weapons').select('*').order('name', { ascending: true })

  if (error) {
    return null
  }

  return data
}

export default async function WeaponsPage() {
  const data = await getData()

  if (!data || data.length === 0) {
    return notFound()
  }

  const pistols = data.filter((weapon) => weapon.type === 'pistols')
  const smgs = data.filter((weapon) => weapon.type === 'smgs')
  const rifles = data.filter((weapon) => weapon.type === 'rifles')
  const heavy = data.filter((weapon) => weapon.type === 'heavy')
  const knives = data.filter((weapon) => weapon.type === 'knives')
  const special = data.filter((weapon) => weapon.type === 'special')

  // TODO: total number of skins
  return (
    <InternalContainer>
      <BreadCrumbBar active="Weapons" />
      <PageTitle title="Browse Weapon Types" />

      <IntroParagraph content="Welcome to the comprehensive guide to all weapon types in Counter-Strike 2. This page offers a detailed overview of every weapon category available in the game, from pistols and rifles to SMGs and heavy weapons. Browse through each type to find specific weapons, complete with images and links to detailed pages. Whether you’re looking to refine your loadout or discover new favorites, our database provides all the information you need to excel in CS2." />

      <div className="w-full space-y-4 pt-8 lg:pt-12">
        <h2 className="text-3xl font-bold">Pistols</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {pistols.map((weapon) => (
            <WeaponCard key={weapon.id} weapon={weapon} />
          ))}
        </div>
      </div>

      <div className="w-full space-y-4 pt-8 lg:pt-12">
        <h2 className="text-3xl font-bold">SMGs</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {smgs.map((weapon) => (
            <WeaponCard key={weapon.id} weapon={weapon} />
          ))}
        </div>
      </div>

      <div className="w-full space-y-4 pt-8 lg:pt-12">
        <h2 className="text-3xl font-bold">Rifles</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {rifles.map((weapon) => (
            <WeaponCard key={weapon.id} weapon={weapon} />
          ))}
        </div>
      </div>

      <div className="w-full space-y-4 pt-8 lg:pt-12">
        <h2 className="text-3xl font-bold">Heavy</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {heavy.map((weapon) => (
            <WeaponCard key={weapon.id} weapon={weapon} />
          ))}
        </div>
      </div>

      <div className="w-full space-y-4 pt-8 lg:pt-12">
        <h2 className="text-3xl font-bold">Knives</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {knives.map((weapon) => (
            <WeaponCard key={weapon.id} weapon={weapon} />
          ))}
        </div>
      </div>

      <div className="w-full space-y-4 pt-8 lg:pt-12">
        <h2 className="text-3xl font-bold">Special</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {special.map((weapon) => (
            <WeaponCard key={weapon.id} weapon={weapon} />
          ))}
        </div>
      </div>
    </InternalContainer>
  )
}
