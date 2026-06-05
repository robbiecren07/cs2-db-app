import { RarityId, SkinWithDetails } from '@/types/custom'
import Image from 'next/image'
import Link from 'next/link'
import { CardContent, Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  weapon: string
  skin: SkinWithDetails
}

export default function MiniSkinCard({ weapon, skin }: Props) {
  return (
    <Link
      href={`/weapons/${weapon}/${skin.shortSlug}`}
      style={{ borderTopColor: skin.rarityColor ? skin.rarityColor : '' }}
      className="card group w-full"
      target="_self"
      prefetch={false}
      aria-label={`View details for ${skin.name}`}
    >
      <Card>
        <CardContent className="flex flex-col h-full p-4">
          <h3
            className="text-sm font-medium transition-colors group-hover:text-white"
            aria-label={`Skin name: ${skin.shortName}`}
          >
            {skin.shortName}
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
            {skin.rarityId && (
              <Badge
                variant={skin.rarityId as RarityId}
                className="text-[10px]"
                aria-label={`Rarity: ${skin.rarityName}`}
              >
                {skin.rarityName}
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
