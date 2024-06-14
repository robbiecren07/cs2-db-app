import { Gloves } from '@/types/custom'
import { createClient } from '@/utils/supabase/client'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import InternalContainer from '@/components/InternalContainer'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import CategoryCard from '@/components/CategoryCard'

type Props = {
  params: { glove: string }
}

export async function generateStaticParams() {
  const supabase = createClient()
  const { data, error } = await supabase.from('gloves').select('*')

  if (error) {
    return []
  }

  return data.map((glove) => ({
    glove: glove.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.glove
  const supabase = createClient()
  const { data } = await supabase.from('gloves').select('*').eq('slug', slug).single()

  if (!data) {
    return {}
  }

  return {
    title: `${data.name} | CS2 Gloves | Counter-Strike 2 Skin`,
    description: `Discover the ${data.name} in Counter-Strike 2. Explore detailed information about this unique glove, including design, prices, and rarity. Enhance your gameplay with the exclusive ${data.name}`,
    alternates: {
      canonical: `/gloves/${slug}`,
    },
  }
}

async function getData(glove: string): Promise<Gloves | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('gloves').select('*').eq('slug', glove).single()

  if (error) {
    return null
  }

  return data
}

export default async function GlovePage({ params }: { params: { glove: string } }) {
  const { glove } = params
  const data = await getData(glove)

  if (!data) {
    return notFound()
  }

  return (
    <InternalContainer>
      <BreadCrumbBar active={data.name.replace('★ ', '')} parent="Gloves" parentHref="/gloves" />
      <PageTitle title={data.name} />

      <div className="w-full flex max-sm:flex-wrap gap-6 py-8 lg:py-12">
        <div className="flex-1 flex-shrink-0 basis-[290px] flex flex-col gap-6 h-full">
          <CategoryCard weaponName={data.name} subTitle="Default" />
        </div>

        <div className="flex-1 basis-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
      </div>
    </InternalContainer>
  )
}
