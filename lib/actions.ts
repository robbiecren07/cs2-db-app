'use server'

import { signakitReady, signakit } from '@/lib/signakit'
import { getVisitorId } from '@/lib/visitor'

export async function trackEvent() {
  await signakitReady
  const visitorId = await getVisitorId()
  const userCtx = signakit.createUserContext(visitorId)
  await userCtx?.trackEvent('form_submit')
}
