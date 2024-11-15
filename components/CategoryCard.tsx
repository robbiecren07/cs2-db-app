import Image from 'next/image'

interface Props {
  weaponName: string
  knifeName?: string | null
  subTitle: string
}

export default function CategoryCard({ weaponName, knifeName, subTitle }: Props) {
  const itemName = knifeName ? knifeName : weaponName
  const imageSrc = `/${weaponName.replace(' ', '_')}.webp`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: itemName,
    image: `https://cs2skinsdb.com${imageSrc}`,
    description: subTitle,
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
    <div className="flex-1 bg-muted p-4 space-y-4 rounded-lg" aria-label={`Category card for ${itemName}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Image
        alt={`Default ${weaponName} skin modal`}
        className="h-[180px] w-full aspect-video object-contain"
        src={`/${weaponName.replace(' ', '_')}.webp`}
        width="290"
        height="180"
        priority
      />
      <div>
        <h2 className="text-white text-lg font-medium text-center" aria-label={`Name: ${itemName}`}>
          {knifeName ? knifeName : weaponName}
        </h2>
        <p className="text-xs text-accent-foreground text-center" aria-label={`Subtitle: ${subTitle}`}>
          {subTitle}
        </p>
      </div>
    </div>
  )
}
