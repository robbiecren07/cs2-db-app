import InternalContainer from '@/components/InternalContainer'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import HeroImage from '@/public/hero_image.png'

export const metadata: Metadata = {
  title: 'CS2 Skins DB | Browse All Counter-Strike 2 Skins, Cases, and Collections',
  description: `Explore CS2 Skins DB, your ultimate resource for all Counter-Strike 2 skins, cases, collections, gloves, and more. Stay updated with the latest in-game items, market prices, and detailed information to enhance your gaming experience.`,
  alternates: {
    canonical: '/',
  },
}

export default function Index() {
  return (
    <InternalContainer>
      <section className="w-full min-h-[50dvh] flex justify-center items-center gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-4xl font-medium text-accent-foreground">
            Welcome to <span className="block text-purple-600 font-bold">CS2 Skins DB</span>
          </h1>
          <p className="xl:max-w-xl font-light">
            The the ultimate destination for Counter-Strike 2 enthusiasts. Our comprehensive database offers detailed
            information on all skins, cases, collections, and more, helping you stay ahead in the game. Whether
            you&lsquo;re a seasoned player or new to the world of CS2, our platform provides everything you need to
            enhance your gaming experience.
          </p>
          <Link
            href="/weapons"
            className="max-w-max h-11 rounded-md px-8 inline-flex items-center justify-center whitespace-nowrap bg-purple-700 transition-colors hover:bg-purple-800"
          >
            Browse Skins
          </Link>
        </div>

        <div className="w-full max-w-[512px] flex">
          <Image src={HeroImage} alt="Karambit Black Blackpearl skin modal" />
        </div>
      </section>

      <section className="w-full py-6 md:py-10 lg:py-16">
        <h2 className="text-2xl font-medium text-accent-foreground">Latest CS2 Case</h2>
        <p>
          Stay updated with the newest cases in CS2. Find out what&lsquo;s inside each case, including the latest skins
          and their market prices.
        </p>
        <div className="case-items"></div>
      </section>

      <section className="w-full py-6 md:py-10 lg:py-16">
        <h2 className="text-2xl font-medium text-accent-foreground">Featured Collections</h2>
        <p>
          Discover the most sought-after collections in Counter-Strike 2. Click on each collection to explore detailed
          information, market prices, and available skins.
        </p>
        <div className="collection-items"></div>
      </section>

      <section className="w-full py-6 md:py-10 lg:py-16">
        <h2 className="text-2xl font-medium text-accent-foreground">Popular CS2 Skins</h2>
        <p>
          Browse through the most popular skins in Counter-Strike 2. See detailed stats, market prices, and find out
          which cases they come from.
        </p>
        <div className="skin-items"></div>
      </section>
    </InternalContainer>
  )
}
