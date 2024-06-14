import { Weapons } from '@/types/custom'
import Image from 'next/image'
import { CardContent, Card } from '@/components/ui/card'
import Link from 'next/link'

interface Props {
  weapon: Weapons
}

export function WeaponCard({ weapon }: Props) {
  return (
    <Link href={`/weapons/${weapon.slug}`} className="card group w-[194px] border-accent-foreground" target="_self">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-medium transition-colors group-hover:text-white">{weapon.name}</h2>
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
