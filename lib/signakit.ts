'use server'

import { cookies } from 'next/headers'
import { createInstance, type SignaKitUserContext } from '@signakit/flags-node'

export async function getSignaKit(slug: string): Promise<{
  userCtx: SignaKitUserContext
} | null> {
  const client = createInstance({
    sdkKey: process.env.SIGNAKIT_SDK_KEY!,
  })

  if (!client) {
    console.error('❌ SignaKit client not created')
    return null
  }

  try {
    const { success, reason } = await client.onReady()
    if (!success) {
      console.error('❌ SignaKit not ready:', reason)
      return null
    }
  } catch (err) {
    console.error('❌ SignaKit failed to initialize:', err)
    return null
  }

  const cookieStore = await cookies()
  const visitorId = cookieStore.get('visitor_id')?.value

  if (!visitorId) {
    console.error('❌ Missing visitor ID')
    return null
  }

  const attributes = {
    pageSlug: slug,
  }

  const userCtx = client.createUserContext(visitorId, attributes)

  if (!userCtx) {
    console.error('❌ SignaKit user context could not be created')
    return null
  }

  return { userCtx }
}
