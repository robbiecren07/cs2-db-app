import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/api'],
    },
    sitemap: 'https://cs2skinsdb.com/sitemap.xml',
  }
}
