import { Skins } from '@/types/custom'
import { Case } from '@/types/database'
import Image from 'next/image'
import { CardContent, Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import AvailableInToolTip from '@/components/AvailableInToolTip'

interface Props {
  weapon: string
  skin: Skins
  index: number
  children?: React.ReactNode
}

type RarityId =
  | 'rarity_common_weapon'
  | 'rarity_uncommon_weapon'
  | 'rarity_rare_weapon'
  | 'rarity_mythical_weapon'
  | 'rarity_legendary_weapon'
  | 'rarity_ancient_weapon'
  | 'rarity_contraband_weapon'
  | 'rarity_ancient'
  | 'souvenir'
  | 'stattrak'

export function SkinCard({ weapon, skin, index, children }: Props) {
  const in_cases: Case[] = typeof skin.in_cases === 'string' ? JSON.parse(skin.in_cases) : skin.in_cases

  return (
    <Link
      href={`/weapons/${weapon}/${skin.short_slug}`}
      style={{ borderTopColor: skin.rarity_color ? skin.rarity_color : '' }}
      className="card group w-full"
      target="_self"
    >
      <Card>
        <CardContent className="flex flex-col h-full p-4">
          {children}
          <h3 className="text-lg font-medium transition-colors group-hover:text-white">{skin.short_name}</h3>
          {skin.collections_name && (
            <object className="relative">
              <Link
                href={`/collections/${skin.collections_slug}`}
                className="text-xs text-accent-foreground font-light transition-colors hover:text-purple-500"
                target="_self"
              >
                {skin.collections_name}
              </Link>
            </object>
          )}
          <div className="my-4 mx-auto transition-transform group-hover:scale-110">
            {skin.image && (
              <Image
                src={skin.image}
                width="290"
                height="150"
                className="aspect-video object-contain"
                alt={`${skin.name} - skin modal`}
                priority={index <= 9}
              />
            )}
          </div>

          {in_cases && <AvailableInToolTip item={{ in_cases }} />}

          <div className="flex flex-wrap gap-2 mt-auto">
            {skin.rarity_id && <Badge variant={skin.rarity_id as RarityId}>{skin.rarity_name}</Badge>}
            {skin.stattrak && <Badge variant="stattrak">StatTrak™</Badge>}
            {skin.souvenir && <Badge variant="souvenir">Souvenir</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
