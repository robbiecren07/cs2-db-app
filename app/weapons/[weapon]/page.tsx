import { Skins, Weapons } from '@/types/custom'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import StatsItem from '@/components/StatsItem'
import StatBoxContainer from '@/components/StatBoxContainer'
import CategoryCard from '@/components/CategoryCard'
import { SkinCard } from '@/components/SkinCard'
import { rarityOrder } from '@/lib/helpers'

interface Data {
  skins: Skins[]
  weaponData: Weapons | null
}

type Props = {
  params: { weapon: string }
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const weapon = params.weapon
  const supabase = createClient()
  const { data } = await supabase.from('skins').select('*').eq('weapon_slug', weapon)

  if (!data) {
    return {}
  }

  return {
    title: `Browse All ${data[0].weapon_name} Skins | CS2 ${data[0].weapon_name} Stats and Skins`,
    description: `Discover all ${data[0].weapon_name} skins in Counter-Strike 2. Explore detailed stats, images, and information for each ${data[0].weapon_name} skin. Stay updated with the latest skins and enhance your gameplay with the best CS2 [Weapon Type] options.`,
    alternates: {
      canonical: `/weapons/${weapon}`,
    },
  }
}

async function getData(weapon: string): Promise<Data> {
  const supabase = createClient()
  try {
    const [skinResponse, weaponsResponse] = await Promise.all([
      supabase.from('skins').select('*').eq('weapon_slug', weapon).order('short_name', { ascending: true }),
      supabase.from('weapons').select('*').eq('slug', weapon).single(),
    ])

    const skins = skinResponse.data || []
    const weaponData = weaponsResponse.data

    return {
      skins: skins.sort((a, b) => (rarityOrder[a.rarity_id] || 999) - (rarityOrder[b.rarity_id] || 999)),
      weaponData,
    }
  } catch (error) {
    return { skins: [], weaponData: null }
  }
}

export default async function WeaponPage({ params }: Props) {
  const { weapon } = params
  const { skins, weaponData } = await getData(weapon)

  if (!skins || skins.length === 0 || !weaponData) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active={skins[0].weapon_name.replace('★ ', '')} parent="Weapons" parentHref="/weapons" />
      <PageTitle title={`Browse All ${weaponData.name} Skins`} />

      <div className="w-full flex max-sm:flex-wrap gap-6 py-8 lg:py-12">
        <div className="flex-1 flex-shrink-0 basis-[290px] flex flex-col gap-6 h-full">
          <CategoryCard
            weaponName={weaponData.name}
            knifeName={weaponData.type === 'knives' ? skins[0].weapon_name : null}
            subTitle="Vanilla"
          />

          <StatBoxContainer title="Base Stats">
            <StatsItem title="Price" stat={weaponData.price} />
            <StatsItem title="Kill Reward" stat={weaponData.kill_reward} />
            <StatsItem title="Raw Damage" stat={weaponData.raw_damage} />
            <StatsItem title="Armor Penetration" stat={weaponData.armor_pen} />
            <StatsItem title="Fire Rate" stat={weaponData.fire_rate} />
            <StatsItem title="Recoil" stat={weaponData.recoil} />
            <StatsItem title="Magazine Size" stat={weaponData.mag_size} />
            <StatsItem title="Ammo Reserve" stat={weaponData.ammo_reserve} />
            <StatsItem title="Reload Time" stat={weaponData.reload_time} />
            <StatsItem title="Movement Speed" stat={weaponData.movement_speed} />
          </StatBoxContainer>

          {weaponData.type === 'knives' || skins[0].weapon_type === 'Special' ? null : (
            <>
              <StatBoxContainer title="Damage Stats">
                <StatsItem title="Damage SR Armor" stat={weaponData.dam_short_armor} sup="*" />
                <StatsItem title="Damage LR Armor" stat={weaponData.dam_long_armor} sup="**" />
                <StatsItem title="Damage SR No Armor" stat={weaponData.dam_short_no_armor} sup="*" />
                <StatsItem title="Damage LR No Armor" stat={weaponData.dam_long_no_armor} sup="**" />
                <StatsItem title="Bullets To Kill Chest SR" stat={weaponData.btk_chest_short} sup="*" />
                <StatsItem title="Bullets To Kill Chest LR" stat={weaponData.bttk_chest_long} sup="**" />
                <StatsItem title="Time To Kill SR" stat={weaponData.ttk_short} sup="*" />
                <StatsItem title="Time To Kill LR" stat={weaponData.ttk_long} sup="**" />
                <div className="flex flex-col pt-2 text-xs text-accent-foreground">
                  <span>* Short Range</span>
                  <span>** Long Range</span>
                </div>
              </StatBoxContainer>

              <StatBoxContainer title="Accuracy Stats">
                <StatsItem title="Fire Inaccuracy" stat={weaponData.fire_inacc} />
                <StatsItem title="Running Inaccuracy" stat={weaponData.run_inacc} />
                <StatsItem title="Standing Inaccuracy" stat={weaponData.stand_inacc} />
                <StatsItem title="Crouching Inaccuracy" stat={weaponData.crouch_inacc} />
                <StatsItem title="Recovery Time Stand" stat={weaponData.recover_time_stand} />
                <StatsItem title="Recovery Time Crouch" stat={weaponData.recover_time_crouch} />
              </StatBoxContainer>
            </>
          )}
        </div>

        <div className="flex-1 basis-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skins.map((skin, i) => {
            return <SkinCard key={skin.id} weapon={weapon} skin={skin} index={i} />
          })}
        </div>
      </div>
    </InternalContainer>
  )
}
