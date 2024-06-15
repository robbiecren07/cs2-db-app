import { RarityId, Skins } from '@/types/custom'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

interface Props {
  skin: Skins
}

export default function MainCard({ skin }: Props) {
  return (
    <div
      style={{ borderTopColor: skin.rarity_color ? skin.rarity_color : '' }}
      className="w-full bg-muted p-4 space-y-4 rounded-lg border-t-4"
    >
      {skin.image && (
        <Image
          alt={`${skin.name} skin modal`}
          className="h-[384px] w-full aspect-video object-contain"
          src={skin.image}
          width="512"
          height="384"
          priority
        />
      )}
      <div className="flex flex-wrap gap-2">
        {skin.rarity_id && <Badge variant={skin.rarity_id as RarityId}>{skin.rarity_name}</Badge>}
        {skin.stattrak && <Badge variant="stattrak">StatTrak™ Available</Badge>}
        {skin.souvenir && <Badge variant="souvenir">Souvenir</Badge>}
      </div>
    </div>
  )
}
