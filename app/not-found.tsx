import Link from 'next/link'
import InternalContainer from '@/components/InternalContainer'

export default function NotFound() {
  return (
    <InternalContainer>
      <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-6 text-center">
        <p className="text-8xl font-mono font-bold bg-gradient-to-br from-violet-300 via-violet-500 to-violet-700 bg-clip-text text-transparent">
          404
        </p>
        <div className="space-y-2">
          <h1 className="text-2xl font-medium text-foreground">Page not found</h1>
          <p className="text-secondary-foreground font-light max-w-sm">
            The item or page you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link
            href="/weapons"
            className="h-11 rounded-md px-8 inline-flex items-center justify-center whitespace-nowrap bg-muted border border-border transition-colors hover:bg-accent"
          >
            Browse Skins
          </Link>
        </div>
      </div>
    </InternalContainer>
  )
}
