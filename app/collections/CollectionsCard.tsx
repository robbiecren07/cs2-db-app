import { Collections } from '@/types/custom'
import Image from 'next/image'
import Link from 'next/link'
import { CardContent, Card } from '@/components/ui/card'

interface Props {
  collection: Collections
  index: number
}

export function CollectionsCard({ collection, index }: Props) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: collection.name,
    url: `https://cs2skinsdb.com/collections/${collection.slug}`,
    image: collection.image || '',
    description: `Explore the ${collection.name} collection featuring unique weapon skins in Counter-Strike 2.`,
  }

  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="card group w-full border-accent-foreground"
      target="_self"
      aria-label={`View details for the ${collection.name} collection`}
    >
      <Card>
        <CardContent className="flex flex-col w-full h-full justify-between p-4">
          <h2
            className="font-medium transition-colors group-hover:text-white"
            aria-label={`Collection name: ${collection.name}`}
          >
            {collection.name}
          </h2>
          <div className="my-4 mx-auto transition-transform group-hover:scale-110">
            {collection.image && (
              <Image
                src={collection.image}
                width="198"
                height="112"
                className="aspect-video object-contain"
                alt={`${collection.name} - visual modal`}
                priority={index < 15}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </Link>
  )
}
