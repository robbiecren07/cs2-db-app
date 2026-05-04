import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_COOKIE_OPTIONS } from './lib/constants'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()
  /**
   * Set Optimizely User ID for FF and web experiments.
   */
  const visitorIdCookie = request.cookies.get('visitor_id')
  if (visitorIdCookie && visitorIdCookie.value) {
    response.cookies.set('visitor_id', visitorIdCookie.value, {
      ...DEFAULT_COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 365,
    })
  } else {
    const visitorId = uuidv4()

    response.cookies.set('visitor_id', visitorId, {
      ...DEFAULT_COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  return response
}

export const config = {
  matcher: ['/'],
}
