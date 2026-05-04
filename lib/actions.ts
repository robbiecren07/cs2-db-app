'use server'

import { getSignaKit } from '@/lib/signakit'

export async function trackEvent() {
  const results = await getSignaKit('/home/')
  if (!results) {
    console.error('Failed to get SignaKit context for tracking event')
    return
  }
  await results.userCtx.trackEvent('form_submit')
}
