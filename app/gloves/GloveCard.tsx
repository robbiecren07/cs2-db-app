import { CaseRef, SkinWithDetails } from '@/types/custom'
import Link from 'next/link'
import Image from 'next/image'
import { CardContent, Card } from '@/components/ui/card'
import AvailableInToolTip from '@/components/AvailableInToolTip'

interface Props {
  glove: SkinWithDetails
  index: number
}

export function GloveCard({ glove, index }: Props) {
  const inCases: CaseRef[] = glove.inCases ?? []

  return (
    <Link
      href={`/gloves/${glove.slug}`}
      className="card group border-t-[#eb4b4b]"
      target="_self"
      prefetch={false}
      aria-label={`View details for ${glove.name}`}
    >
      <Card>
        <CardContent className="flex flex-col h-full p-4">
          <h2
            className="text-sm transition-colors group-hover:text-white"
            aria-label={`Glove name: ${glove.shortName}`}
          >
            {glove.weaponName}
            <span className="text-base font-medium block">{glove.shortName}</span>
          </h2>
          <div className="my-4 mx-auto transition-transform group-hover:scale-110">
            {glove.image && (
              <Image
                src={glove.image}
                width="290"
                height="150"
                className="aspect-video object-contain max-sm:object-right"
                alt={`${glove.name} - skin modal`}
                priority={index <= 9}
              />
            )}
          </div>

          {inCases.length > 0 && <AvailableInToolTip item={{ inCases }} />}
        </CardContent>
      </Card>
    </Link>
  )
}
