'use client'

import { trackEvent } from '@/lib/actions'

interface Props {
  name: string
  text: string
}

export default function ClientButtonTwo({ name, text }: Props) {
  return (
    <a
      id="client-button"
      href={`https://steamcommunity.com/market/listings/730/${encodeURIComponent(`${name} (Minimal Wear)`)}`}
      className="h-12 px-4 lg:px-6 py-2 inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-base font-semibold 
              ring-offset-background transition-colors bg-foreground text-background hover:bg-secondary-foreground focus-visible:outline-hidden 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      target="_blank"
      rel="nofollow noreferrer"
      aria-label={`View ${name} on Steam Market`}
      onClick={() => trackEvent()}
    >
      {text}
    </a>
  )
}
