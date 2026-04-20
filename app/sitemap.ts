import { neon } from '@neondatabase/serverless'
import type { MetadataRoute } from 'next'
import type {
  Agents,
  Collectables,
  Collections,
  Crates,
  Gloves,
  Patches,
  Skins,
  SouvenirPackages,
  Weapons,
} from '@/types/custom'

const BASE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000'

interface Data {
  agents: Agents[]
  crates: Crates[]
  collections: Collections[]
  gloves: Gloves[]
  patches: Patches[]
  collectables: Collectables[]
  packages: SouvenirPackages[]
  weapons: Weapons[]
  skins: Skins[]
}

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export async function getData(): Promise<Data> {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const [
      agentRes,
      cratesRes,
      collectionsRes,
      glovesRes,
      patchesRes,
      collectablesRes,
      packagesRes,
      weaponsRes,
      skinsRes,
    ] = await Promise.all([
      sql`SELECT slug FROM agents`,
      sql`SELECT slug FROM crates`,
      sql`SELECT slug FROM collections`,
      sql`SELECT slug FROM gloves`,
      sql`SELECT slug FROM patches`,
      sql`SELECT slug FROM collectables WHERE type = 'Pin'`,
      sql`SELECT slug FROM souvenir_packages`,
      sql`SELECT slug FROM weapons`,
      sql`SELECT short_slug, weapon_slug FROM skins`,
    ])

    return {
      agents: agentRes as Agents[],
      crates: cratesRes as Crates[],
      collections: collectionsRes as Collections[],
      gloves: glovesRes as Gloves[],
      patches: patchesRes as Patches[],
      collectables: collectablesRes as Collectables[],
      packages: packagesRes as SouvenirPackages[],
      weapons: weaponsRes as Weapons[],
      skins: skinsRes as Skins[],
    }
  } catch (error) {
    console.error('Error fetching data for sitemap:', error)
    return {
      agents: [],
      crates: [],
      collections: [],
      gloves: [],
      patches: [],
      collectables: [],
      packages: [],
      weapons: [],
      skins: [],
    }
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { agents, crates, collections, gloves, patches, collectables, packages, weapons, skins } = await getData()

  const rootPages = [
    `${BASE_URL}/agents`,
    `${BASE_URL}/cases`,
    `${BASE_URL}/collections`,
    `${BASE_URL}/gloves`,
    `${BASE_URL}/patches`,
    `${BASE_URL}/pins`,
    `${BASE_URL}/souvenir-packages`,
    `${BASE_URL}/weapons`,
  ]

  const urls = [
    ...agents.map(({ slug }) => `${BASE_URL}/agents/${slug}`),
    ...crates.map(({ slug }) => `${BASE_URL}/cases/${slug}`),
    ...collections.map(({ slug }) => `${BASE_URL}/collections/${slug}`),
    ...gloves.map(({ slug }) => `${BASE_URL}/gloves/${slug}`),
    ...patches.map(({ slug }) => `${BASE_URL}/patches/${slug}`),
    ...collectables.map(({ slug }) => `${BASE_URL}/pins/${slug}`),
    ...packages.map(({ slug }) => `${BASE_URL}/souvenir-packages/${slug}`),
    ...weapons.map(({ slug }) => `${BASE_URL}/weapons/${slug}`),
    ...skins.map((skin) => `${BASE_URL}/weapons/${skin.weapon_slug}/${skin.short_slug}`),
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
