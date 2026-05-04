'use server'

import { cookies } from 'next/headers'
import { cache } from 'react'

export const getVisitorId = cache(async (): Promise<string> => {
  const cookieStore = await cookies()
  return cookieStore.get('visitor_id')?.value ?? 'anonymous'
})
