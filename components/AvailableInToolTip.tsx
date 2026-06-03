'use client'

import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CaseRef } from '@/types/custom'
import Link from 'next/link'
import slugify from 'slugify'

interface Props {
  item: {
    inCases: CaseRef[]
  }
}

export default function AvailableInToolTip({ item }: Props) {
  if (!item.inCases || item.inCases.length === 0) return null

  const casesText = item.inCases.length === 1 ? 'case' : 'cases'

  return (
    <>
      <div className="pb-2">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger
              className="text-sm text-accent-foreground font-light"
              aria-label={`Available in case: ${casesText}`}
            >
              Available in {item.inCases.length} {casesText}
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-2">
                {item.inCases.map((caseItem: CaseRef) => {
                  return (
                    <Link
                      key={caseItem.id}
                      href={`/cases/${slugify(caseItem.name, { lower: true, strict: true })}`}
                      className="transition-colors hover:text-purple-500"
                      prefetch={false}
                      aria-label={`View all skins in the ${caseItem.name} case`}
                    >
                      {caseItem.name}
                    </Link>
                  )
                })}
              </div>
              <TooltipArrow />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  )
}
