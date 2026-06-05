import { RarityId, SkinWithDetails } from '@/types/custom'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface Props {
  skin: SkinWithDetails
}

export default function MainCard({ skin }: Props) {
  return (
    <div
      style={{ borderTopColor: skin.rarityColor ? skin.rarityColor : '' }}
      className="w-full bg-muted p-4 space-y-4 rounded-lg border-t-4"
    >
      {skin.image && (
        <Image
          alt={`${skin.name} skin modal`}
          className="h-48 md:h-96 w-full aspect-video object-contain"
          src={skin.image}
          width="512"
          height="384"
          priority
        />
      )}
      <div className="flex flex-wrap gap-2">
        {skin.rarityId && (
          <Badge variant={skin.rarityId as RarityId} aria-label={`Rarity: ${skin.rarityName}`}>
            {skin.rarityName}
          </Badge>
        )}
        {skin.stattrak && (
          <Badge variant="stattrak" aria-label="StatTrak™ skin">
            StatTrak™ Available
          </Badge>
        )}
        {skin.souvenir && (
          <Badge variant="souvenir" aria-label="Souvenir skin">
            Souvenir
          </Badge>
        )}
      </div>
    </div>
  )
}
