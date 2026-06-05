'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { InfiniteBaseItem, RarityId } from '@/types/custom'

interface Props {
  item: InfiniteBaseItem
  index: number
  basePath: string
}

export default function InfiniteItemCard({ item, index, basePath }: Props) {
  const displayName = item.shortName ?? item.name

  return (
    <Link
      href={`${basePath}/${item.slug}`}
      style={{ borderTopColor: item.rarityColor ?? '' }}
      className="card group w-full"
      prefetch={false}
      aria-label={`View details for ${displayName}`}
    >
      <Card>
        <CardContent className="flex flex-col w-full h-full justify-between p-4">
          <h2 className="sr-only">{item.name}</h2>
          <h3 className="font-medium transition-colors group-hover:text-white">
            {displayName}
            {item.subName && (
              <span className="block text-sm text-accent-foreground font-normal">{item.subName}</span>
            )}
          </h3>
          {item.collectionName && (
            <span className="text-xs text-accent-foreground font-light mt-0.5">{item.collectionName}</span>
          )}
          <div className="py-4 mt-auto mx-auto transition-transform group-hover:scale-110">
            {item.image && (
              <Image
                src={item.image}
                width={290}
                height={150}
                className="aspect-video object-contain"
                alt={`${item.name} - visual`}
                priority={index < 15}
              />
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {item.rarityId && (
              <Badge variant={item.rarityId as RarityId}>{item.rarityName}</Badge>
            )}
            {item.effect && item.effect !== 'Other' && (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                {item.effect}
              </span>
            )}
            {item.exclusive && (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#e4ae39] text-black">
                Exclusive
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
