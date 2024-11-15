import { Collections } from '@/types/custom'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
  collection: Collections
}

export default function GlobalCollectionCard({ collection }: Props) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: collection.name,
    url: `https://cs2skinsdb.com/collections/${collection.slug}`,
    image: collection.image || '',
    description: `Explore the ${collection.name} collection featuring unique weapon skins in Counter-Strike 2.`,
  }

  return (
    <div className="w-1/3 p-2 group">
      <Link
        href={`/collections/${collection.slug}`}
        className="block w-full"
        target="_self"
        aria-label={`View details for the ${collection.name} collection`}
      >
        <div className="w-full mx-auto flex flex-col items-center gap-2">
          {collection.image && (
            <Image
              src={collection.image}
              width="120"
              height="100"
              className="aspect-[4/3] object-contain"
              alt={collection.name ? collection.name : 'Collection Image'}
            />
          )}
          <h3
            className="text-sm text-center transition-colors group-hover:text-purple-600"
            aria-label={`Collection name: ${collection.name}`}
          >
            {collection.name}
          </h3>
        </div>
      </Link>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    </div>
  )
}
