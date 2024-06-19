'use client'

import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Case } from '@/types/custom'
import Link from 'next/link'
import slugify from 'slugify'

interface Props {
  item: {
    in_cases: Case[]
  }
}

export default function AvailableInToolTip({ item }: Props) {
  if (!item.in_cases || item.in_cases.length === 0) return null

  const casesText = item.in_cases.length === 1 ? 'case' : 'cases'

  return (
    <>
      <div className="pb-2">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger className="text-sm text-accent-foreground font-light">
              Available in {item.in_cases.length} {casesText}
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-2">
                {item.in_cases.map((item: Case) => {
                  return (
                    <Link
                      key={item.id}
                      href={`/cases/${slugify(item.name, { lower: true, strict: true })}`}
                      className="transition-colors hover:text-purple-500"
                    >
                      {item.name}
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
