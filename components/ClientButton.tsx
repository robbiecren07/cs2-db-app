'use client'

import { trackEvent } from '@/lib/actions'
import Link from 'next/link'

interface Props {
  href: string
  text: string
}

export default function ClientButton({ href, text }: Props) {
  return (
    <Link
      id="client-button"
      href={href}
      className="max-w-max h-11 rounded-md px-8 inline-flex items-center justify-center whitespace-nowrap bg-purple-700 transition-colors hover:bg-purple-800"
      onClick={() => trackEvent()}
      prefetch={false}
    >
      {text}
    </Link>
  )
}
