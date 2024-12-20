import { RarityId, Skins } from '@/types/custom'
import Image from 'next/image'
import Link from 'next/link'
import { CardContent, Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  weapon: string
  skin: Skins
}

export default function MiniSkinCard({ weapon, skin }: Props) {
  return (
    <Link
      href={`/weapons/${weapon}/${skin.short_slug}`}
      style={{ borderTopColor: skin.rarity_color ? skin.rarity_color : '' }}
      className="card group w-full"
      target="_self"
      aria-label={`View details for ${skin.name}`}
    >
      <Card>
        <CardContent className="flex flex-col h-full p-4">
          <h3
            className="text-sm font-medium transition-colors group-hover:text-white"
            aria-label={`Skin name: ${skin.short_name}`}
          >
            {skin.short_name}
          </h3>
          <div className="my-4 mx-auto transition-transform group-hover:scale-110">
            {skin.image && (
              <Image
                src={skin.image}
                width="170"
                height="98"
                className="aspect-video object-contain"
                alt={`${skin.name} - skin modal`}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
            {skin.rarity_id && (
              <Badge
                variant={skin.rarity_id as RarityId}
                className="text-[10px]"
                aria-label={`Rarity: ${skin.rarity_name}`}
              >
                {skin.rarity_name}
              </Badge>
            )}
            {skin.stattrak && (
              <Badge variant="stattrak" className="text-[10px]" aria-label="StatTrak™ skin">
                StatTrak™
              </Badge>
            )}
            {skin.souvenir && (
              <Badge variant="souvenir" className="text-[10px]" ria-label="Souvenir skin">
                Souvenir
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
