import { Crates, Gloves, Skins } from '@/types/custom'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import InternalContainer from '@/components/InternalContainer'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import PageTitle from '@/components/PageTitle'
import Image from 'next/image'
import { SkinCard } from '@/app/weapons/SkinCard'
import { CardContent, Card } from '@/components/ui/card'
import IntroParagraph from '@/components/IntroParagraph'
import { rarityOrder } from '@/lib/helpers'

interface Data {
  data: Crates | null
  skins: Skins[]
  gloves: Gloves[]
}

type Props = {
  params: { case: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const crate = params.case
  const supabase = createClient()
  const { data } = await supabase.from('crates').select('*').eq('slug', crate).single()

  if (!data) {
    return {}
  }

  return {
    title: `${data.name} | CS2 Weapon Skins and Knives`,
    description: `Explore the ${data.name} in Counter-Strike 2. Discover the best weapon skins and knives available in this case, including their prices and rarity.`,
    alternates: {
      canonical: `/cases/${crate}`,
    },
  }
}

async function getData(crate: string): Promise<Data> {
  const supabase = createClient()
  const { data, error } = await supabase.from('crates').select('*').eq('slug', crate).single()

  if (error) {
    return { data: null, skins: [], gloves: [] }
  }

  const { data: skinData, error: skinError } = await supabase.from('skins').select('*').contains('case_ids', [data.id])

  if (skinError || !skinData) {
    return { data, skins: [], gloves: [] }
  }

  const { data: gloveData, error: gloveError } = await supabase
    .from('gloves')
    .select('*')
    .contains('case_ids', [data.id])

  if (gloveError || !gloveData) {
    return { data, skins: skinData, gloves: [] }
  }

  return {
    data,
    skins: skinError
      ? []
      : skinData.sort((a, b) => (rarityOrder[a.rarity_id] || 999) - (rarityOrder[b.rarity_id] || 999)) || [],
    gloves: gloveError ? [] : gloveData || [],
  }
}

export default async function CasePage({ params }: Props) {
  const { case: crate } = params
  const { data, skins, gloves } = await getData(crate)

  if (!data) {
    return notFound()
  }

  const containsKnives = skins.some((skin) => skin.weapon_type === 'Knives')
  const knivesCount = skins.filter((skin) => skin.weapon_type === 'Knives').length
  const knifeImage = skins.find((skin) => skin.weapon_type === 'Knives')?.image

  return (
    <InternalContainer>
      <BreadCrumbBar active={data.name} parent="Cases" parentHref="/cases" />
      <PageTitle title={data.name} />

      <p className="text-center font-light pt-2">Released: {data.first_sale_date}</p>

      <div className="w-full flex flex-col gap-6 xl:gap-10 pt-4">
        <div className="grow flex flex-col lg:flex-row justify-center items-center gap-4 py-4 lg:py-8">
          <div className="flex-1 flex justify-center items-center">
            {data.image && (
              <Image
                alt={`${data.name} skin modal`}
                className="h-[198px] w-full max-w-[256px] aspect-video object-contain"
                src={data.image}
                width="256"
                height="198"
                priority
              />
            )}
          </div>

          <div className="flex-1">
            <IntroParagraph content={data.intro_paragraph} />
          </div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <h2 className="sr-only">{data.name} Case Skins</h2>
          {containsKnives && (
            <Link href={`/cases/${crate}/knives`} style={{ borderTopColor: '#e4ae39' }} className="card group w-full">
              <Card>
                <CardContent className="flex flex-col h-full p-4">
                  <h3 className="text-lg font-medium transition-colors group-hover:text-white">Knives</h3>
                  <p className="text-xs text-accent-foreground font-light">Rare Special Items</p>
                  <div className="my-4 mx-auto transition-transform group-hover:scale-110">
                    {knifeImage && (
                      <Image
                        src={knifeImage}
                        width="290"
                        height="150"
                        className="aspect-video object-contain"
                        alt={`${data.name} Knife - skin modal`}
                        priority
                      />
                    )}
                  </div>

                  <p className="text-xs text-accent-foreground font-light mt-auto">{knivesCount} Possible Knives</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {gloves && gloves.length > 0 && (
            <Link href={`/cases/${crate}/gloves`} style={{ borderTopColor: '#e4ae39' }} className="card group w-full">
              <Card>
                <CardContent className="flex flex-col h-full p-4">
                  <h3 className="text-lg font-medium transition-colors group-hover:text-white">Gloves</h3>
                  <p className="text-xs text-accent-foreground font-light">Rare Special Items</p>
                  <div className="my-4 mx-auto transition-transform group-hover:scale-110">
                    {gloves[0].image && (
                      <Image
                        src={gloves[0].image}
                        width="290"
                        height="150"
                        className="aspect-video object-contain"
                        alt={`${data.name} Gloves - skin modal`}
                        priority
                      />
                    )}
                  </div>

                  <p className="text-xs text-accent-foreground font-light mt-auto">{gloves.length} Possible Gloves</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {skins &&
            skins.map((skin, i) => {
              if (skin.weapon_type === 'Knives') return null
              return <SkinCard key={skin.id} weapon={skin.weapon_slug} skin={skin} index={i} />
            })}
        </div>
      </div>
    </InternalContainer>
  )
}
