'use cache'

import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import StatsItem from '@/components/StatsItem'
import StatBoxContainer from '@/components/StatBoxContainer'
import CategoryCard from '@/components/CategoryCard'
import SortFilterContainer from '@/components/SortFilterContainer'
import { rarityOrder } from '@/lib/helpers'
import type { SkinWithDetails, Weapon } from '@/types/custom'
import type { Metadata } from 'next'

interface Data {
  skins: SkinWithDetails[]
  weaponData: Weapon | null
}

type Props = {
  params: { weapon: string }
}


export async function generateStaticParams() {
  const data = await db.select({ slug: schema.weapons.slug }).from(schema.weapons)
  return data.map((w) => ({ weapon: w.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { weapon } = await params

  const data = await db.select().from(schema.weapons).where(eq(schema.weapons.slug, weapon)).limit(1)

  if (!data.length) return {}

  return {
    title: `Browse All ${data[0].name} Skins | CS2 ${data[0].name} Stats and Skins`,
    description: `Discover all ${data[0].name} skins in Counter-Strike 2. Explore detailed stats, images, and information for each ${data[0].name} skin.`,
    alternates: {
      canonical: `/weapons/${weapon}`,
    },
  }
}

async function getData(weapon: string): Promise<Data> {
  const { getCollectionsForSkins } = await import('@/db/queries')

  const [skinsData, weaponData] = await Promise.all([
    db
      .select({
        id: schema.skins.id,
        name: schema.skins.name,
        slug: schema.skins.slug,
        shortSlug: schema.skins.shortSlug,
        shortName: schema.skins.shortName,
        weaponId: schema.skins.weaponId,
        weaponName: schema.skins.weaponName,
        weaponSlug: schema.skins.weaponSlug,
        categoryId: schema.skins.categoryId,
        categoryName: schema.skins.categoryName,
        rarityId: schema.skins.rarityId,
        patternId: schema.skins.patternId,
        patternName: schema.skins.patternName,
        paintIndex: schema.skins.paintIndex,
        minFloat: schema.skins.minFloat,
        maxFloat: schema.skins.maxFloat,
        stattrak: schema.skins.stattrak,
        souvenir: schema.skins.souvenir,
        featured: schema.skins.featured,
        teamId: schema.skins.teamId,
        description: schema.skins.description,
        marketHashName: schema.skins.marketHashName,
        legacyModel: schema.skins.legacyModel,
        image: schema.skins.image,
        rarityName: schema.rarities.name,
        rarityColor: schema.rarities.color,
      })
      .from(schema.skins)
      .leftJoin(schema.rarities, eq(schema.skins.rarityId, schema.rarities.id))
      .where(eq(schema.skins.weaponSlug, weapon))
      .orderBy(asc(schema.skins.shortName)),
    db.select().from(schema.weapons).where(eq(schema.weapons.slug, weapon)).limit(1),
  ])

  if (!weaponData.length) return { skins: [], weaponData: null }

  const collectionMap = await getCollectionsForSkins(skinsData.map((s) => s.id))
  const skins: SkinWithDetails[] = skinsData
    .map((s) => ({
      ...s,
      collectionName: collectionMap.get(s.id)?.collectionName ?? null,
      collectionSlug: collectionMap.get(s.id)?.collectionSlug ?? null,
    }))
    .sort((a, b) => (rarityOrder[a.rarityId ?? ''] || 999) - (rarityOrder[b.rarityId ?? ''] || 999))

  return { skins, weaponData: weaponData[0] }
}

export default async function WeaponPage({ params }: Props) {
  const { weapon } = await params
  const { skins, weaponData } = await getData(weapon)

  if (!skins || skins.length === 0 || !weaponData) {
    return notFound()
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Browse All ${weaponData.name} Skins | CS2 ${weaponData.name} Stats and Skins`,
    description: `Discover all ${weaponData.name} skins in Counter-Strike 2. Explore detailed stats, images, and information for each ${weaponData.name} skin.`,
    url: `https://cs2skinsdb.com/weapons/${weaponData.slug}`,
    itemListElement: skins.map((skin, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: skin.name,
      image: skin.image,
      url: `https://cs2skinsdb.com/skins/${skin.slug}`,
      description: skin.description || `Detailed stats and information about the ${skin.name}.`,
    })),
  }

  return (
    <InternalContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <BreadCrumbBar active={skins[0].weaponName?.replace('★ ', '') ?? ''} parent="Weapons" parentHref="/weapons" />
      <PageTitle title={`Browse All ${weaponData.name} Skins`} />

      <div className="relative w-full flex max-sm:flex-wrap gap-6 py-8 lg:py-12">
        <div className="relative flex-1 shrink-0 basis-72.5 flex flex-col gap-6 h-full">
          <CategoryCard
            weaponName={weaponData.name}
            knifeName={weaponData.type === 'knives' ? skins[0].weaponName : null}
            subTitle="Vanilla"
          />

          <StatBoxContainer title="Base Stats">
            <StatsItem title="Price" stat={weaponData.price} />
            <StatsItem title="Kill Reward" stat={weaponData.killReward} />
            <StatsItem title="Raw Damage" stat={weaponData.rawDamage} />
            <StatsItem title="Armor Penetration" stat={weaponData.armorPen} />
            <StatsItem title="Fire Rate" stat={weaponData.fireRate} />
            <StatsItem title="Recoil" stat={weaponData.recoil} />
            <StatsItem title="Magazine Size" stat={weaponData.magSize} />
            <StatsItem title="Ammo Reserve" stat={weaponData.ammoReserve} />
            <StatsItem title="Reload Time" stat={weaponData.reloadTime} />
            <StatsItem title="Movement Speed" stat={weaponData.movementSpeed} />
          </StatBoxContainer>

          {weaponData.type === 'knives' || skins[0].categoryName === 'Equipment' ? null : (
            <>
              <StatBoxContainer title="Damage Stats">
                <StatsItem title="Damage SR Armor" stat={weaponData.damShortArmor} sup="*" />
                <StatsItem title="Damage LR Armor" stat={weaponData.damLongArmor} sup="**" />
                <StatsItem title="Damage SR No Armor" stat={weaponData.damShortNoArmor} sup="*" />
                <StatsItem title="Damage LR No Armor" stat={weaponData.damLongNoArmor} sup="**" />
                <StatsItem title="Bullets To Kill Chest SR" stat={weaponData.btkChestShort} sup="*" />
                <StatsItem title="Bullets To Kill Chest LR" stat={weaponData.bttkChestLong} sup="**" />
                <StatsItem title="Time To Kill SR" stat={weaponData.ttkShort} sup="*" />
                <StatsItem title="Time To Kill LR" stat={weaponData.ttkLong} sup="**" />
                <div className="flex flex-col pt-2 text-xs text-accent-foreground">
                  <span>* Short Range</span>
                  <span>** Long Range</span>
                </div>
              </StatBoxContainer>

              <StatBoxContainer title="Accuracy Stats">
                <StatsItem title="Fire Inaccuracy" stat={weaponData.fireInacc} />
                <StatsItem title="Running Inaccuracy" stat={weaponData.runInacc} />
                <StatsItem title="Standing Inaccuracy" stat={weaponData.standInacc} />
                <StatsItem title="Crouching Inaccuracy" stat={weaponData.crouchInacc} />
                <StatsItem title="Recovery Time Stand" stat={weaponData.recoverTimeStand} />
                <StatsItem title="Recovery Time Crouch" stat={weaponData.recoverTimeCrouch} />
              </StatBoxContainer>
            </>
          )}
        </div>

        <SortFilterContainer skins={skins} weapon={weapon} />
      </div>
    </InternalContainer>
  )
}
