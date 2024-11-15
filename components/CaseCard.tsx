import { Crates } from '@/types/custom'
import Image from 'next/image'
import { CardContent, Card } from '@/components/ui/card'
import Link from 'next/link'

interface Props {
  crate: Crates
  index?: number
}

export function CaseCard({ crate, index }: Props) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: crate.name,
    image: crate.image || '',
    url: `https://cs2skinsdb.com/cases/${crate.slug}`,
    releaseDate: crate.first_sale_date,
    description: `Discover the ${crate.name}, a Counter-Strike 2 case featuring unique skins.`,
    brand: {
      '@type': 'Thing',
      name: 'Counter-Strike 2',
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: 'N/A',
      highPrice: 'N/A',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Steam Community Market',
      },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Link
        href={`/cases/${crate.slug}`}
        className="card group w-full border-accent-foreground"
        target="_self"
        aria-label={`View details for the ${crate.name} case`}
      >
        <Card>
          <CardContent className="flex flex-col w-full h-full justify-between p-4">
            <h2
              className="text-lg font-medium transition-colors group-hover:text-white"
              aria-label={`Case name: ${crate.name}`}
            >
              {crate.name}
            </h2>
            <div className="my-4 mx-auto transition-transform group-hover:scale-110">
              {crate.image && (
                <Image
                  src={crate.image}
                  width="290"
                  height="150"
                  className="aspect-video object-contain"
                  alt={`${crate.name} - visual modal`}
                  priority={index ? index < 15 : false}
                />
              )}
            </div>
            <span
              className="text-sm text-accent-foreground font-light"
              aria-label={`Release date: ${crate.first_sale_date}`}
            >
              Released: {crate.first_sale_date}
            </span>
          </CardContent>
        </Card>
      </Link>
    </>
  )
}
