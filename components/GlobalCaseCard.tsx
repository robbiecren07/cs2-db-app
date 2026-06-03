import { CaseRef } from '@/types/custom'
import Image from 'next/image'
import Link from 'next/link'
import slugify from 'slugify'

interface Props {
  item: {
    inCases: CaseRef[]
  }
}

export default function GlobalCaseCard({ item }: Props) {
  if (!item.inCases || item.inCases.length === 0) return null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            item.inCases.map((caseItem) => ({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: caseItem.name,
              url: `https://cs2skinsdb.com/${
                caseItem.name.includes('Souvenir') ? 'souvenir-packages' : 'cases'
              }/${slugify(caseItem.name, { lower: true, strict: true })}`,
              image: caseItem.image || '',
              description: `Explore the ${caseItem.name}, a Counter-Strike 2 case featuring unique skins.`,
              category: caseItem.name.includes('Souvenir') ? 'Souvenir Package' : 'Weapon Case',
            }))
          ),
        }}
      />

      {item.inCases.map((caseItem: CaseRef) => {
        let caseSlug = 'cases'
        if (caseItem.name.includes('Souvenir')) {
          caseSlug = 'souvenir-packages'
        }
        return (
          <div key={caseItem.id} className="w-1/3 p-2 group">
            <Link
              href={`/${caseSlug}/${slugify(caseItem.name, { lower: true, strict: true })}`}
              className="block w-full"
              target="_self"
              prefetch={false}
              aria-label={`View details for ${caseItem.name}`}
            >
              <div className="w-full flex flex-col items-center gap-2">
                {caseItem.image && (
                  <Image
                    src={caseItem.image}
                    width="120"
                    height="100"
                    className="aspect-4/3 object-contain"
                    alt={caseItem.name}
                  />
                )}
                <h3
                  className="text-sm text-center transition-colors group-hover:text-purple-600"
                  aria-label={`Case name: ${caseItem.name}`}
                >
                  {caseItem.name}
                </h3>
              </div>
            </Link>
          </div>
        )
      })}
    </>
  )
}
