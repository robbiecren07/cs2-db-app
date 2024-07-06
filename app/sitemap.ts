import {
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
import { createClient } from '@/utils/supabase/client'
import { MetadataRoute } from 'next'

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
  const supabase = createClient()
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
      supabase.from('agents').select('slug'),
      supabase.from('crates').select('slug'),
      supabase.from('collections').select('slug'),
      supabase.from('gloves').select('slug'),
      supabase.from('patches').select('slug'),
      supabase.from('collectables').select('slug').eq('type', 'Pin'),
      supabase.from('souvenir_packages').select('slug'),
      supabase.from('weapons').select('slug'),
      supabase.from('skins').select('short_slug, weapon_slug'),
    ])

    if (
      agentRes.error ||
      cratesRes.error ||
      collectionsRes.error ||
      glovesRes.error ||
      patchesRes.error ||
      collectablesRes.error ||
      packagesRes.error ||
      weaponsRes.error ||
      skinsRes.error
    ) {
      throw new Error('Error fetching data from Supabase')
    }

    return {
      agents: agentRes.data as Agents[],
      crates: cratesRes.data as Crates[],
      collections: collectionsRes.data as Collections[],
      gloves: glovesRes.data as Gloves[],
      patches: patchesRes.data as Patches[],
      collectables: collectablesRes.data as Collectables[],
      packages: packagesRes.data as SouvenirPackages[],
      weapons: weaponsRes.data as Weapons[],
      skins: skinsRes.data as Skins[],
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
