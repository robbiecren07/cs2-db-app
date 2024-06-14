import { SouvenirPackages } from '@/types/custom'
import Image from 'next/image'
import { CardContent, Card } from '@/components/ui/card'
import Link from 'next/link'

interface Props {
  item: SouvenirPackages
  index: number
}

export function PackagesCard({ item, index }: Props) {
  return (
    <Link
      href={`/souvenir-packages/${item.slug}-souvenir-package`}
      className="card group w-full border-accent-foreground"
      target="_self"
    >
      <Card>
        <CardContent className="flex flex-col w-full h-full justify-between p-4">
          <h2 className="text-sm font-medium transition-colors group-hover:text-white">{item.name}</h2>
          <div className="my-4 mx-auto transition-transform group-hover:scale-110">
            {item.image && (
              <Image
                src={item.image}
                width="198"
                height="112"
                className="aspect-video object-contain"
                alt={`${item.name} - visual modal`}
                priority={index < 15}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
