import { Database } from './database'

export type Skins = Database['public']['Tables']['skins']['Row']

export type Crates = Database['public']['Tables']['crates']['Row']

export type Collections = Database['public']['Tables']['collections']['Row']

export type Weapons = Database['public']['Tables']['weapons']['Row']

export type Gloves = Database['public']['Tables']['gloves']['Row']

export type Agents = Database['public']['Tables']['agents']['Row']

export type SouvenirPackages = Database['public']['Tables']['souvenir_packages']['Row']
