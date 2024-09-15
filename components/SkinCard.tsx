import { RarityId, Skins, Case } from '@/types/custom'
import Image from 'next/image'
import Link from 'next/link'
import { CardContent, Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AvailableInToolTip from '@/components/AvailableInToolTip'

interface Props {
  weapon: string
  skin: Skins
  index?: number
  useTooltip?: boolean
  children?: React.ReactNode
}

export function SkinCard({ weapon, skin, index, useTooltip = true, children }: Props) {
  const in_cases: Case[] = typeof skin.in_cases === 'string' ? JSON.parse(skin.in_cases) : skin.in_cases

  return (
    <Link
      href={`/weapons/${weapon}/${skin.short_slug}`}
      style={{ borderTopColor: skin.rarity_color ? skin.rarity_color : '' }}
      className="card group w-full"
      target="_self"
    >
      <Card>
        <CardContent className="flex flex-col p-4">
          {children}
          <h3
            className={`text-lg font-medium transition-colors group-hover:text-white ${
              !skin.collections_name && 'pb-6'
            }`}
          >
            {skin.short_name}
          </h3>
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
                priority={index ? index <= 9 : false}
              />
            )}
          </div>

          {useTooltip && in_cases && <AvailableInToolTip item={{ in_cases }} />}

          <div className="flex flex-wrap gap-2 mt-auto">
            {skin.rarity_id && <Badge variant={skin.rarity_id as RarityId}>{skin.rarity_name}</Badge>}
            {skin.souvenir && <Badge variant="souvenir">Souvenir</Badge>}
            {skin.stattrak && <Badge variant="stattrak">StatTrak™</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
