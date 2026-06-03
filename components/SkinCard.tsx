import { RarityId, SkinWithDetails, CaseRef } from '@/types/custom'
import Image from 'next/image'
import Link from 'next/link'
import { CardContent, Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AvailableInToolTip from '@/components/AvailableInToolTip'

interface Props {
  weapon: string
  skin: SkinWithDetails
  index?: number
  useTooltip?: boolean
  children?: React.ReactNode
}

export function SkinCard({ weapon, skin, index, useTooltip = true, children }: Props) {
  const inCases: CaseRef[] = skin.inCases ?? []

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
        <CardContent className="flex flex-col p-4">
          {children}
          <h3
            className={`text-lg font-medium transition-colors group-hover:text-white ${
              !skin.collectionName && 'pb-6'
            }`}
            aria-label={`Skin name: ${skin.shortName}`}
          >
            {skin.shortName}
          </h3>
          {skin.collectionName && (
            <object className="relative">
              <Link
                href={`/collections/${skin.collectionSlug}`}
                className="text-xs text-accent-foreground font-light transition-colors hover:text-purple-500"
                target="_self"
                prefetch={false}
                aria-label={`View all skins in the ${skin.collectionName} collection`}
              >
                {skin.collectionName}
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

          {useTooltip && inCases.length > 0 && <AvailableInToolTip item={{ inCases }} />}

          <div className="flex flex-wrap gap-2 mt-auto">
            {skin.rarityId && (
              <Badge variant={skin.rarityId as RarityId} aria-label={`Rarity: ${skin.rarityName}`}>
                {skin.rarityName}
              </Badge>
            )}
            {skin.souvenir && (
              <Badge variant="souvenir" aria-label="Souvenir skin">
                Souvenir
              </Badge>
            )}
            {skin.stattrak && (
              <Badge variant="stattrak" aria-label="StatTrak™ skin">
                StatTrak™
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
