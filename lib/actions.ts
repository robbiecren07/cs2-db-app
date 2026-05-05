'use server'

import { signakit } from '@/lib/signakit'
import { getVisitorId } from '@/lib/visitor'

export async function trackEvent() {
  const visitorId = await getVisitorId()
  const userCtx = signakit.createUserContext(visitorId)
  await userCtx?.trackEvent('form_submit')
}
