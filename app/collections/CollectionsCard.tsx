import { Collections } from '@/types/custom'
import Image from 'next/image'
import { CardContent, Card } from '@/components/ui/card'
import Link from 'next/link'

interface Props {
  collection: Collections
  index: number
}

export function CollectionsCard({ collection, index }: Props) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="card group w-full border-accent-foreground"
      target="_self"
    >
      <Card>
        <CardContent className="flex flex-col w-full h-full justify-between p-4">
          <h2 className="font-medium transition-colors group-hover:text-white">{collection.name}</h2>
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
    </Link>
  )
}
