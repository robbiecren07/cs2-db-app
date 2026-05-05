export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { signakitReady } = await import('./lib/signakit')
    await signakitReady
  }
}
