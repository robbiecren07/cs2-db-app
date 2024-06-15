import { Agents, RarityId } from '@/types/custom'
import Image from 'next/image'
import { CardContent, Card } from '@/components/ui/card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Props {
  item: Agents
  index: number
}

export function AgentsCard({ item, index }: Props) {
  if (!item) {
    return null
  }

  return (
    <Link
      href={`/agents/${item.slug}`}
      style={{ borderColor: item.rarity_color ? item.rarity_color : '' }}
      className="card group w-full"
      target="_self"
    >
      <Card>
        <CardContent className="flex flex-col w-full h-full justify-between p-4">
          <h2 className="sr-only">{item.name}</h2>
          <h3 className="font-medium transition-colors group-hover:text-white">
            {item.short_name} <span className="block text-sm text-accent-foreground  font-normal">{item.sub_name}</span>
          </h3>
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
          {item.collections_name && (
            <span className="relative text-xs text-accent-foreground font-light">{item.collections_name}</span>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            {item.rarity_id && <Badge variant={item.rarity_id as RarityId}>{item.rarity_name}</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
