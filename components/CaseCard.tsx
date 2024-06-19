import { Crates } from '@/types/custom'
import Image from 'next/image'
import { CardContent, Card } from '@/components/ui/card'
import Link from 'next/link'

interface Props {
  crate: Crates
  index?: number
}

export function CaseCard({ crate, index }: Props) {
  return (
    <Link href={`/cases/${crate.slug}`} className="card group w-full border-accent-foreground" target="_self">
      <Card>
        <CardContent className="flex flex-col w-full h-full justify-between p-4">
          <h2 className="text-lg font-medium transition-colors group-hover:text-white">{crate.name}</h2>
          <div className="my-4 mx-auto transition-transform group-hover:scale-110">
            {crate.image && (
              <Image
                src={crate.image}
                width="290"
                height="150"
                className="aspect-video object-contain"
                alt={`${crate.name} - visual modal`}
                priority={index ? index < 15 : false}
              />
            )}
          </div>
          <span className="text-sm text-accent-foreground font-light">Released: {crate.first_sale_date}</span>
        </CardContent>
      </Card>
    </Link>
  )
}
