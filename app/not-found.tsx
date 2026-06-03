import Link from 'next/link'
import InternalContainer from '@/components/InternalContainer'

export default function NotFound() {
  return (
    <InternalContainer>
      <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-6 text-center">
        <p className="text-8xl font-mono font-bold text-purple-600">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-medium text-accent-foreground">Page not found</h1>
          <p className="text-accent-foreground font-light max-w-sm">
            The item or page you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="h-11 rounded-md px-8 inline-flex items-center justify-center whitespace-nowrap bg-purple-700 transition-colors hover:bg-purple-800"
          >
            Go Home
          </Link>
          <Link
            href="/weapons"
            className="h-11 rounded-md px-8 inline-flex items-center justify-center whitespace-nowrap bg-secondary transition-colors hover:bg-secondary/80"
          >
            Browse Skins
          </Link>
        </div>
      </div>
    </InternalContainer>
  )
}
