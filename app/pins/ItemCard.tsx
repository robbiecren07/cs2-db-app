import { CollectableWithRarity, RarityId } from '@/types/custom'
import Image from 'next/image'
import { CardContent, Card } from '@/components/ui/card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Props {
  item: CollectableWithRarity
  index: number
}

export default function ItemCard({ item, index }: Props) {
  if (!item) {
    return null
  }

  return (
    <Link
      href={`/pins/${item.slug}`}
      style={{ borderColor: item.rarityColor ? item.rarityColor : '' }}
      className="card group w-full"
      target="_self"
      prefetch={false}
    >
      <Card>
        <CardContent className="flex flex-col w-full h-full justify-between p-4">
          <h2 className="sr-only">{item.name}</h2>
          <h3 className="font-medium transition-colors group-hover:text-white">{item.shortName}</h3>
          <div className="py-4 mt-auto mx-auto transition-transform group-hover:scale-110">
            {item.image && (
              <Image
                src={item.image}
                width="290"
                height="150"
                className="aspect-video object-contain"
                alt={`${item.name} - visual modal`}
                priority={index < 15}
              />
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {item.rarityId && <Badge variant={item.rarityId as RarityId}>{item.rarityName}</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
