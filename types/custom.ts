import { Database } from './database'

export type Skins = Database['public']['Tables']['skins']['Row']

export type Crates = Database['public']['Tables']['crates']['Row']

export type Collections = Database['public']['Tables']['collections']['Row']

export type Weapons = Database['public']['Tables']['weapons']['Row']

export type Gloves = Database['public']['Tables']['gloves']['Row']

export type Agents = Database['public']['Tables']['agents']['Row']

export type SouvenirPackages = Database['public']['Tables']['souvenir_packages']['Row']

export type Patches = Database['public']['Tables']['patches']['Row']

export type Collectables = Database['public']['Tables']['collectables']['Row']

export type RarityId =
  | 'rarity_common'
  | 'rarity_uncommon'
  | 'rarity_rare'
  | 'rarity_mythical'
  | 'rarity_legendary'
  | 'rarity_ancient'
  | 'rarity_contraband'
  | 'rarity_ancient'
  | 'souvenir'
  | 'stattrak'

export interface Case {
  id: number
  name: string
  slug: string
  image: string
}
