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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Float Range',
    description: 'The float range of the skin indicates wear level from minimum to maximum values.',
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Minimum Float',
        value: minFloat.toFixed(2),
      },
      {
        '@type': 'PropertyValue',
        name: 'Maximum Float',
        value: maxFloat.toFixed(2),
      },
      ...Object.entries(WEAR_RANGES).map(([label, range]) => ({
        '@type': 'PropertyValue',
        name: `${label} Float Range`,
        value: `${range[0].toFixed(2)} - ${range[1].toFixed(2)}`,
      })),
    ],
  }

  return (
    <div
      className="w-full lg:max-w-md mx-auto bg-muted py-4 px-6 rounded-lg space-y-3"
      aria-label={`Float Bar displaying minimum float ${minFloat.toFixed(2)} and maximum float ${maxFloat.toFixed(2)}`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <h3 className="text-lg text-center">Float Limits</h3>
      <div className="relative pt-6">
        <div className="relative h-2 bg-red-600">
          <div
            className="absolute h-2 bg-green-600"
            style={{
              left: getPosition(minFloat),
              width: `calc(${getPosition(maxFloat)} - ${getPosition(minFloat)})`,
            }}
            aria-label={`Usable float range from ${minFloat.toFixed(2)} to ${maxFloat.toFixed(2)}`}
          />
          <div
            className="absolute h-2 bg-red-600"
            style={{
              left: getPosition(maxFloat),
              width: `calc(100% - ${getPosition(maxFloat)})`,
            }}
            aria-label={`Float range exceeding ${maxFloat.toFixed(2)}`}
          />
        </div>

        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger
              className="absolute -top-1 w-8"
              style={{ left: `calc(${getPosition(minFloat)} - 16px)` }}
              aria-label={`Minimum float value: ${minFloat.toFixed(2)}`}
            >
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
            <TooltipTrigger
              className="absolute -top-1 w-8"
              style={{ left: `calc(${getPosition(maxFloat)} - 16px)` }}
              aria-label={`Maximum float value: ${maxFloat.toFixed(2)}`}
            >
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
                  <TooltipTrigger
                    aria-label={`Wear range: ${label}, from ${range[0].toFixed(2)} to ${range[1].toFixed(2)}`}
                  >
                    {label}
                  </TooltipTrigger>
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
