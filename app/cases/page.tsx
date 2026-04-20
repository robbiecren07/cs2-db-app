'use cache'

import { neon } from '@neondatabase/serverless'
import { notFound } from 'next/navigation'
import PageTitle from '@/components/PageTitle'
import { BreadCrumbBar } from '@/components/BreadCrumbBar'
import InternalContainer from '@/components/InternalContainer'
import IntroParagraph from '@/components/IntroParagraph'
import { CaseCard } from '@/components/CaseCard'
import type { Crates } from '@/types/custom'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All CS2 Cases | Browse Counter-Strike 2 Cases and Skins',
  description:
    'Discover all CS2 cases in our comprehensive database. Browse, compare, and find the best prices for Counter-Strike 2 weapon skins. Stay updated with the latest cases and rare items.',
  alternates: {
    canonical: '/cases',
  },
}

async function getData(): Promise<Crates[] | null> {
  const sql = neon(process.env.DATABASE_URL!)
  const data = await sql`SELECT * FROM crates ORDER BY first_sale_date DESC`

  if (!data || data.length === 0) {
    return null
  }

  return data as Crates[]
}

export default async function CasesPage() {
  const data = await getData()

  if (!data) {
    return notFound()
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'All CS2 Cases | Browse Counter-Strike 2 Cases and Skins',
    description:
      'Discover all CS2 cases in our comprehensive database. Browse, compare, and find the best prices for Counter-Strike 2 weapon skins. Stay updated with the latest cases and rare items.',
    url: 'https://cs2skinsdb.com/cases',
    itemListElement: data.map((crate, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crate.name,
      description: crate.description || `Explore skins and items in the ${crate.name} case.`,
      url: `https://cs2skinsdb.com/cases/${crate.slug}`,
      image: crate.image,
      datePublished: crate.first_sale_date,
    })),
  }

  return (
    <InternalContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <BreadCrumbBar active="Cases" />
      <PageTitle title="All CS2 Cases" />

      <IntroParagraph content="Welcome to the ultimate hub for Counter-Strike 2 cases. Our database offers a detailed look at every CS2 case available, from the latest releases to the rarest finds. Whether you're searching for the iconic AK-47 | Case Hardened or the coveted Gamma Doppler knives, our platform provides all the information you need to make informed decisions. Explore, compare, and keep up with the market trends to enhance your gaming experience." />

      <div className="w-full grid grid-cols-card gap-6 py-8 lg:py-12">
        {data.map((crate, i) => (
          <CaseCard key={crate.id} crate={crate} index={i} />
        ))}
      </div>
    </InternalContainer>
  )
}
