import { Case } from '@/types/custom'
import Image from 'next/image'
import Link from 'next/link'
import slugify from 'slugify'

interface Props {
  item: {
    in_cases: Case[]
  }
}

export default function GlobalCaseCard({ item }: Props) {
  if (!item.in_cases || item.in_cases.length === 0) return null

  return (
    <>
      {item.in_cases.map((item: Case) => {
        let caseSlug = 'case'
        if (item.name.includes('Souvenir')) {
          caseSlug = 'souvenir-packages'
        }
        return (
          <div key={item.id} className="w-1/3 p-2 group">
            <Link
              href={`/${caseSlug}/${slugify(item.name, { lower: true, strict: true })}`}
              className="block w-full"
              target="_self"
            >
              <div className="w-full flex flex-col items-center gap-2">
                {item.image && (
                  <Image
                    src={item.image}
                    width="120"
                    height="100"
                    className="aspect-[4/3] object-contain"
                    alt={item.name}
                  />
                )}
                <h3 className="text-sm text-center transition-colors group-hover:text-purple-600">{item.name}</h3>
              </div>
            </Link>
          </div>
        )
      })}
    </>
  )
}
