import { Montserrat } from 'next/font/google'
import localFont from 'next/font/local'
import Head from 'next/head'
import { Suspense } from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { siteData } from '@/lib/json'
import './globals.css'

const DEFAULT_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

const bigShouldersDisplay = localFont({
  src: '../fonts/BigShoulders.ttf',
  variable: '--font-big-shoulders-display',
})

export const metadata = {
  metadataBase: new URL(DEFAULT_URL),
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    site_name: 'CS2 Skins DB',
  },
  creator: 'Robbie Crenshaw',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CS2 Skins DB',
    url: 'https://cs2skinsdb.com',
  }

  return (
    <html lang="en" className={`${montserrat.variable} ${bigShouldersDisplay.variable}`}>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteData) }} />
      </Head>

      <Suspense fallback={null}>
        <body>
          <main className="min-h-screen flex flex-col items-center">
            <Header />
            {children}
            <Footer />
          </main>
        </body>
      </Suspense>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!} />
    </html>
  )
}
