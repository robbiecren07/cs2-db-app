import { year } from './currentYear'

export const siteData = {
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
