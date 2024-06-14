import { Collections, Skins, SouvenirPackages } from '@/types/custom'
import { createClient } from '@/utils/supabase/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageTitle from '@/components/PageTitle'
import InternalContainer from '@/components/InternalContainer'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import { SkinCard } from '@/app/weapons/SkinCard'
import IntroParagraph from '@/components/IntroParagraph'
import Image from 'next/image'

interface SouvenirData {
  data: SouvenirPackages | null
  skins: Skins[]
}

type Props = {
  params: { slug: string }
}

export async function generateStaticParams() {
  const supabase = createClient()
  const { data, error } = await supabase.from('souvenir_packages').select('slug')

  if (error) {
    return []
  }

  return data.map((post) => ({
    slug: `${post.slug}-souvenir-package`,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug
  const oldSlug = slug.replace('-souvenir-package', '')
  const supabase = createClient()
  const { data } = await supabase.from('souvenir_packages').select('*').eq('slug', oldSlug).single()

  if (!data) {
    return {}
  }

  return {
    title: `${data.name} | CS2 Skins DB`,
    description: `Discover the ${data.name} in Counter-Strike 2. Browse through the unique weapon skins, find detailed information on prices and rarity, and stay updated with the latest additions to the collection.`,
    alternates: {
      canonical: `/souvenir-packages/${slug}`,
    },
  }
}

async function getData(slug: string): Promise<SouvenirData> {
  const oldSlug = slug.replace('-souvenir-package', '')
  const supabase = createClient()
  const { data, error } = await supabase.from('souvenir_packages').select('*').eq('slug', oldSlug).single()

  if (error) {
    return { data: null, skins: [] }
  }

  const { data: skinData, error: skinError } = await supabase.from('skins').select('*').contains('case_ids', [data.id])

  if (skinError || !skinData) {
    return { data, skins: [] }
  }

  const rarityOrder: Record<string, number> = {
    rarity_common_weapon: 7,
    rarity_uncommon_weapon: 6,
    rarity_rare_weapon: 5,
    rarity_mythical_weapon: 4,
    rarity_legendary_weapon: 3,
    rarity_ancient_weapon: 2,
    rarity_contraband_weapon: 1,
  }

  return {
    data,
    skins: skinData.sort((a, b) => rarityOrder[a.rarity_id] - rarityOrder[b.rarity_id]),
  }
}

export default async function SouvenirPage({ params }: Props) {
  const { slug } = params
  const { data, skins } = await getData(slug)

  if (!data || !skins) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active={data.name} parent="Souvenir Packages" parentHref="/souvenir-packages" />
      <PageTitle title={data.name} />

      <div className="w-full flex flex-col gap-6 xl:gap-10 pt-4">
        <div className="grow flex flex-col lg:flex-row justify-center items-center gap-4 py-4 lg:py-8">
          <div className="flex-1 flex justify-center items-center">
            {data.image && (
              <Image
                src={data.image}
                width="198"
                height="112"
                className="aspect-video object-contain"
                alt={`${data.name} - visual modal`}
                priority
              />
            )}
          </div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skins.map((skin, i) => {
            return (
              <SkinCard key={skin.id} weapon={skin.weapon_slug} skin={skin} index={i}>
                <h2 className="sr-only">{skin.weapon_name}</h2>
              </SkinCard>
            )
          })}
        </div>
      </div>
    </InternalContainer>
  )
}
