import { db } from '@/db'
import * as schema from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000'

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [agents, crates, collections, patches, collectables, packages, weapons, skins, gloves, keychains, stickers, graffiti, musicKits] = await Promise.all([
    db.select({ slug: schema.agents.slug }).from(schema.agents),
    db.select({ slug: schema.crates.slug }).from(schema.crates).where(eq(schema.crates.type, 'Case')),
    db.select({ slug: schema.collections.slug }).from(schema.collections),
    db.select({ slug: schema.patches.slug }).from(schema.patches),
    db.select({ slug: schema.collectables.slug }).from(schema.collectables).where(eq(schema.collectables.type, 'Pin')),
    db
      .select({ slug: schema.crates.slug })
      .from(schema.crates)
      .where(inArray(schema.crates.type, ['Souvenir', 'Souvenir Highlight'])),
    db.select({ slug: schema.weapons.slug }).from(schema.weapons),
    db.select({ shortSlug: schema.skins.shortSlug, weaponSlug: schema.skins.weaponSlug }).from(schema.skins),
    db.select({ slug: schema.skins.slug }).from(schema.skins).where(eq(schema.skins.categoryName, 'Gloves')),
    db.select({ slug: schema.keychains.slug }).from(schema.keychains),
    db.select({ slug: schema.stickers.slug }).from(schema.stickers),
    db.select({ slug: schema.graffiti.slug }).from(schema.graffiti),
    db.select({ slug: schema.musicKits.slug }).from(schema.musicKits),
  ])

  const rootPages = [
    `${BASE_URL}/agents`,
    `${BASE_URL}/cases`,
    `${BASE_URL}/collections`,
    `${BASE_URL}/gloves`,
    `${BASE_URL}/graffiti`,
    `${BASE_URL}/keychains`,
    `${BASE_URL}/music-kits`,
    `${BASE_URL}/patches`,
    `${BASE_URL}/pins`,
    `${BASE_URL}/souvenir-packages`,
    `${BASE_URL}/stickers`,
    `${BASE_URL}/weapons`,
  ]

  const urls = [
    ...agents.map(({ slug }) => `${BASE_URL}/agents/${slug}`),
    ...crates.map(({ slug }) => `${BASE_URL}/cases/${slug}`),
    ...collections.map(({ slug }) => `${BASE_URL}/collections/${slug}`),
    ...gloves.map(({ slug }) => `${BASE_URL}/gloves/${slug}`),
    ...graffiti.map(({ slug }) => `${BASE_URL}/graffiti/${slug}`),
    ...keychains.map(({ slug }) => `${BASE_URL}/keychains/${slug}`),
    ...musicKits.map(({ slug }) => `${BASE_URL}/music-kits/${slug}`),
    ...patches.map(({ slug }) => `${BASE_URL}/patches/${slug}`),
    ...collectables.map(({ slug }) => `${BASE_URL}/pins/${slug}`),
    ...packages.map(({ slug }) => `${BASE_URL}/souvenir-packages/${slug}`),
    ...stickers.map(({ slug }) => `${BASE_URL}/stickers/${slug}`),
    ...weapons.map(({ slug }) => `${BASE_URL}/weapons/${slug}`),
    ...skins.map((skin) => `${BASE_URL}/weapons/${skin.weaponSlug ?? ''}/${skin.shortSlug}`),
  ]

  return [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as ChangeFrequency,
      priority: 1,
    },
    ...rootPages.map((url) => ({
      url,
      lastModified: new Date(),
      changeFrequency: 'yearly' as ChangeFrequency,
      priority: 0.8,
    })),
    ...urls.map((url) => ({
      url,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    })),
  ]
}
