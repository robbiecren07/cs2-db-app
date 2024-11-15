import { Montserrat, Big_Shoulders_Display } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Head from 'next/head'
import './globals.css'

const DEFAULT_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

const bigShouldersDisplay = Big_Shoulders_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-big-shoulders-display',
})

export const metadata = {
  metadataBase: new URL(DEFAULT_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    site_name: 'CS2 Skins DB',
  },
  creator: 'Robbie Crenshaw',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear()

  const siteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CS2 Skins DB',
    url: 'https://cs2skinsdb.com',
    description:
      'CS2 Skins DB - Explore detailed information on Counter-Strike 2 weapon skins, cases, collections, gloves, and more.',
    copyrightHolder: 'cs2skinsdb.com',
    copyrightYear: year,
    inLanguage: 'en',
    isFamilyFriendly: true,
    publisher: {
      '@type': 'Organization',
      name: 'CS2 Skins DB',
      url: 'https://cs2skinsdb.com',
    },
  }

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

      <body>
        <main className="min-h-screen flex flex-col items-center">
          <Header />
          {children}
          <Footer />
        </main>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!} />
    </html>
  )
}
