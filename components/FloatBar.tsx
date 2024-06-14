'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  minFloat: number | null
  maxFloat: number | null
}

const WEAR_RANGES = {
  FN: [0.0, 0.07],
  MW: [0.07, 0.15],
  FT: [0.15, 0.38],
  WW: [0.38, 0.45],
  BS: [0.45, 1.0],
}

export default function FloatBar({ minFloat, maxFloat }: Props) {
  if (minFloat === null || maxFloat === null) {
    return null
  }
  const getPosition = (value: number) => `${(value * 100).toFixed(2)}%`

  const getTooltipContent = (label: string, range: number[]) =>
    `${label}: ${range[0].toFixed(2)} - ${range[1].toFixed(2)}`

  return (
    <div className="w-full lg:max-w-md mx-auto bg-muted py-4 px-6 rounded-lg space-y-3">
      <h3 className="text-lg text-center">Float Limits</h3>
      <div className="relative pt-6">
        <div className="relative h-2 bg-red-600">
          <div
            className="absolute h-2 bg-green-600"
            style={{
              left: getPosition(minFloat),
              width: `calc(${getPosition(maxFloat)} - ${getPosition(minFloat)})`,
            }}
          />
          <div
            className="absolute h-2 bg-red-600"
            style={{
              left: getPosition(maxFloat),
              width: `calc(100% - ${getPosition(maxFloat)})`,
            }}
          />
        </div>

        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger className="absolute -top-1 w-8" style={{ left: `calc(${getPosition(minFloat)} - 16px)` }}>
              <div className="flex flex-col items-center">
                <div className="text-xs mb-1">{minFloat.toFixed(2)}</div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-t-secondary-foreground border-l-transparent border-r-transparent"></div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Minimum Float</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger className="absolute -top-1 w-8" style={{ left: `calc(${getPosition(maxFloat)} - 16px)` }}>
              <div className="flex flex-col items-center">
                <div className="text-xs mb-1">{maxFloat.toFixed(2)}</div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-t-secondary-foreground border-l-transparent border-r-transparent"></div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Maximum Float</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex justify-between text-xs pt-2">
          {Object.entries(WEAR_RANGES).map(([label, range]) => (
            <div key={label} className="relative">
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger>{label}</TooltipTrigger>
                  <TooltipContent>
                    <p>{getTooltipContent(label, range)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
