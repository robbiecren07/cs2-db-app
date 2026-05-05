import { createInstance } from '@signakit/flags-node/next'
import type { SignaKitClient } from '@signakit/flags-node'

const globalForSignaKit = globalThis as unknown as {
  signakit: SignaKitClient
  signakitReady: Promise<{ success: boolean; reason?: string }>
}

if (!globalForSignaKit.signakit) {
  const client = createInstance({
    sdkKey: process.env.SIGNAKIT_SDK_KEY!,
  })

  if (!client) {
    throw new Error('[SignaKit] Failed to create client — check your SIGNAKIT_SDK_KEY')
  }

  globalForSignaKit.signakit = client
  globalForSignaKit.signakitReady = client.onReady()
}

export const signakit = globalForSignaKit.signakit
export const signakitReady = globalForSignaKit.signakitReady
