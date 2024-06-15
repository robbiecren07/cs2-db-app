import { Gloves } from '@/types/custom'
import Image from 'next/image'
import Link from 'next/link'
import { CardContent, Card } from '@/components/ui/card'

interface Props {
  item: Gloves
}

export default function MiniGloveCard({ item }: Props) {
  return (
    <Link href={`/gloves/${item.short_slug}`} className="card group w-full border-t-[#eb4b4b]" target="_self">
      <Card>
        <CardContent className="flex flex-col h-full p-4">
          <h3 className="font-medium transition-colors group-hover:text-white">{item.short_name}</h3>
          <div className="my-4 mx-auto transition-transform group-hover:scale-110">
            {item.image && (
              <Image
                src={item.image}
                width="200"
                height="112"
                className="aspect-video object-contain"
                alt={`${item.name} - skin modal`}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
