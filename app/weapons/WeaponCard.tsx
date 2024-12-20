import { Weapons } from '@/types/custom'
import Image from 'next/image'
import Link from 'next/link'
import { CardContent, Card } from '@/components/ui/card'

interface Props {
  weapon: Weapons
}

export function WeaponCard({ weapon }: Props) {
  return (
    <Link
      href={`/weapons/${weapon.slug}`}
      className="card group w-[194px] border-accent-foreground"
      target="_self"
      aria-label={`View details about weapon: ${weapon.name}`}
    >
      <Card>
        <CardContent className="p-4">
          <h2
            className="text-lg font-medium transition-colors group-hover:text-white"
            aria-label={`Weapon name: ${weapon.name}`}
          >
            {weapon.name}
          </h2>
          <div className="my-4 transition-transform group-hover:scale-110">
            <Image
              src={`/${weapon.name.replace(' ', '_')}.webp`}
              width="290"
              height="150"
              className="aspect-video object-contain"
              alt={`${weapon.name} - vanilla skin modal`}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
