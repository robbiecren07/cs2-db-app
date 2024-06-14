import { Gloves, Skins } from '@/types/custom'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import InternalContainer from '@/components/InternalContainer'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import PageTitle from '@/components/PageTitle'
import { SkinCard } from '@/app/weapons/SkinCard'
import { GloveCard } from '@/app/gloves/GloveCard'

interface SkinData {
  knives: Skins[]
  gloves: Gloves[]
}

type Props = {
  params: { case: string; slug: string }
}

export async function generateStaticParams() {
  return [{ slug: 'knives' }, { slug: 'gloves' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug
  const crate = params.case

  const caseName = crate
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `${caseName} ${slug === 'knifes' ? 'Knives' : 'Gloves'} | CS2 Skins DB`,
    description: `Discover the exclusive collection of ${slug} in the ${caseName} for Counter-Strike 2. Browse through the rare and coveted items, including detailed information on prices and rarity.`,
    alternates: {
      canonical: `/cases/${crate}/${slug}`,
    },
  }
}

async function getData(crate: string, slug: string): Promise<SkinData> {
  const supabase = createClient()
  const { data, error } = await supabase.from('crates').select('*').eq('slug', crate).single()

  if (error) {
    return { knives: [], gloves: [] }
  }

  if (slug === 'knives') {
    const { data: knives, error: knivesError } = await supabase
      .from('skins')
      .select('*')
      .contains('case_ids', [data.id])

    if (knivesError) {
      return { knives: [], gloves: [] }
    }

    return { knives, gloves: [] }
  }

  if (slug === 'gloves') {
    const { data: gloves, error: glovesError } = await supabase
      .from('gloves')
      .select('*')
      .contains('case_ids', [data.id])

    if (glovesError) {
      return { knives: [], gloves: [] }
    }

    return { knives: [], gloves }
  }

  return { knives: [], gloves: [] }
}

export default async function CasePage({ params }: Props) {
  const { case: crate, slug } = params
  const { knives, gloves } = await getData(crate, slug)

  if (!knives && !gloves) {
    return notFound()
  }

  const caseName = crate
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  if (slug === 'knives') {
    return (
      <InternalContainer>
        <BreadCrumbBar
          active="Knives"
          parent={caseName}
          parentHref={`/cases/${crate}`}
          grandparent="Cases"
          grandparentHref="/cases"
        />
        <PageTitle title={`${caseName} Knives`} />

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 xl:pt-12">
          {knives.map((skin, i) => {
            if (skin.weapon_type !== 'Knives') return null
            return (
              <SkinCard key={skin.id} weapon={skin.weapon_slug} skin={skin} index={i}>
                <h2 className="sr-only">{skin.weapon_name}</h2>
              </SkinCard>
            )
          })}
        </div>
      </InternalContainer>
    )
  }

  if (slug === 'gloves') {
    return (
      <InternalContainer>
        <BreadCrumbBar
          active="Gloves"
          parent={caseName}
          parentHref={`/cases/${crate}`}
          grandparent="Cases"
          grandparentHref="/cases"
        />
        <PageTitle title={`${caseName} Gloves`} />

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 xl:pt-10">
          {gloves.map((skin, i) => (
            <GloveCard key={skin.id} glove={skin} index={i} />
          ))}
        </div>
      </InternalContainer>
    )
  }

  return notFound()
}
