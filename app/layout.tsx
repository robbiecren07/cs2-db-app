import { Montserrat, Big_Shoulders_Display } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

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
  metadataBase: new URL(defaultUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    site_name: 'CS2 Skins DB',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${bigShouldersDisplay.variable}`}>
      <body>
        <main className="min-h-screen flex flex-col items-center">
          <Header />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  )
}
