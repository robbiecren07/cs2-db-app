export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      agents: {
        Row: {
          collections_name: string
          collections_slug: string
          description: string | null
          id: string
          image: string
          name: string
          rarity_color: string | null
          rarity_id: string | null
          rarity_name: string | null
          short_name: string
          slug: string
          sub_name: string
          team_id: string | null
          unique_id: string | null
        }
        Insert: {
          collections_name?: string
          collections_slug?: string
          description?: string | null
          id?: string
          image?: string
          name: string
          rarity_color?: string | null
          rarity_id?: string | null
          rarity_name?: string | null
          short_name?: string
          slug?: string
          sub_name?: string
          team_id?: string | null
          unique_id?: string | null
        }
        Update: {
          collections_name?: string
          collections_slug?: string
          description?: string | null
          id?: string
          image?: string
          name?: string
          rarity_color?: string | null
          rarity_id?: string | null
          rarity_name?: string | null
          short_name?: string
          slug?: string
          sub_name?: string
          team_id?: string | null
          unique_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          category_id: string | null
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          category_id?: string | null
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          category_id?: string | null
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      collectables: {
        Row: {
          description: string | null
          genuine: boolean | null
          id: string
          image: string
          name: string
          rarity_color: string
          rarity_id: string
          rarity_name: string
          short_name: string
          slug: string
          type: string | null
          unique_id: string | null
        }
        Insert: {
          description?: string | null
          genuine?: boolean | null
          id?: string
          image?: string
          name: string
          rarity_color?: string
          rarity_id?: string
          rarity_name?: string
          short_name?: string
          slug?: string
          type?: string | null
          unique_id?: string | null
        }
        Update: {
          description?: string | null
          genuine?: boolean | null
          id?: string
          image?: string
          name?: string
          rarity_color?: string
          rarity_id?: string
          rarity_name?: string
          short_name?: string
          slug?: string
          type?: string | null
          unique_id?: string | null
        }
        Relationships: []
      }
      collections: {
        Row: {
          id: string
          image: string
          name: string
          slug: string
        }
        Insert: {
          id: string
          image: string
          name: string
          slug?: string
        }
        Update: {
          id?: string
          image?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      crates: {
        Row: {
          contains: Json
          contains_rare: Json
          description: string | null
          first_sale_date: string
          id: string
          image: string
          intro_paragraph: string
          name: string
          short_name: string
          slug: string
          type: string | null
        }
        Insert: {
          contains?: Json
          contains_rare?: Json
          description?: string | null
          first_sale_date?: string
          id: string
          image?: string
          intro_paragraph: string
          name: string
          short_name?: string
          slug?: string
          type?: string | null
        }
        Update: {
          contains?: Json
          contains_rare?: Json
          description?: string | null
          first_sale_date?: string
          id?: string
          image?: string
          intro_paragraph?: string
          name?: string
          short_name?: string
          slug?: string
          type?: string | null
        }
        Relationships: []
      }
      gloves: {
        Row: {
          case_ids: string[]
          category_id: string | null
          description: string
          id: string
          image: string
          in_cases: Json
          max_float: number | null
          min_float: number | null
          name: string
          paint_index: number | null
          pattern_id: string | null
          rarity_id: string
          short_name: string
          short_slug: string
          slug: string
          souvenir: boolean | null
          stattrak: boolean | null
          team_id: string | null
          weapon_id: string | null
          weapon_id_ref: string | null
          weapon_name: string
          weapon_slug: string
        }
        Insert: {
          case_ids?: string[]
          category_id?: string | null
          description?: string
          id: string
          image?: string
          in_cases?: Json
          max_float?: number | null
          min_float?: number | null
          name: string
          paint_index?: number | null
          pattern_id?: string | null
          rarity_id: string
          short_name?: string
          short_slug: string
          slug: string
          souvenir?: boolean | null
          stattrak?: boolean | null
          team_id?: string | null
          weapon_id?: string | null
          weapon_id_ref?: string | null
          weapon_name?: string
          weapon_slug: string
        }
        Update: {
          case_ids?: string[]
          category_id?: string | null
          description?: string
          id?: string
          image?: string
          in_cases?: Json
          max_float?: number | null
          min_float?: number | null
          name?: string
          paint_index?: number | null
          pattern_id?: string | null
          rarity_id?: string
          short_name?: string
          short_slug?: string
          slug?: string
          souvenir?: boolean | null
          stattrak?: boolean | null
          team_id?: string | null
          weapon_id?: string | null
          weapon_id_ref?: string | null
          weapon_name?: string
          weapon_slug?: string
        }
        Relationships: []
      }
      patches: {
        Row: {
          description: string
          id: string
          image: string
          name: string
          rarity_color: string
          rarity_id: string
          rarity_name: string
          short_name: string
          slug: string
          unique_id: string | null
        }
        Insert: {
          description?: string
          id?: string
          image?: string
          name: string
          rarity_color?: string
          rarity_id?: string
          rarity_name?: string
          short_name?: string
          slug: string
          unique_id?: string | null
        }
        Update: {
          description?: string
          id?: string
          image?: string
          name?: string
          rarity_color?: string
          rarity_id?: string
          rarity_name?: string
          short_name?: string
          slug?: string
          unique_id?: string | null
        }
        Relationships: []
      }
      patterns: {
        Row: {
          id: string
          name: string | null
          pattern_id: string | null
          slug: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          pattern_id?: string | null
          slug?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          pattern_id?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      rarities: {
        Row: {
          color: string | null
          id: string
          name: string
          order: number | null
          rarity_id: string | null
          slug: string | null
        }
        Insert: {
          color?: string | null
          id?: string
          name: string
          order?: number | null
          rarity_id?: string | null
          slug?: string | null
        }
        Update: {
          color?: string | null
          id?: string
          name?: string
          order?: number | null
          rarity_id?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      skins: {
        Row: {
          case_ids: string[]
          category_id: string | null
          collections_name: string | null
          collections_slug: string | null
          description: string | null
          id: string
          image: string
          in_cases: Json | null
          max_float: number | null
          min_float: number | null
          name: string
          paint_index: number | null
          pattern_id: string | null
          pattern_name: string
          rarity_color: string
          rarity_id: string
          rarity_name: string
          short_name: string
          short_slug: string
          slug: string
          souvenir: boolean | null
          stattrak: boolean | null
          team_id: string | null
          weapon_id: string | null
          weapon_id_ref: string | null
          weapon_name: string
          weapon_slug: string
          weapon_type: string | null
        }
        Insert: {
          case_ids?: string[]
          category_id?: string | null
          collections_name?: string | null
          collections_slug?: string | null
          description?: string | null
          id?: string
          image?: string
          in_cases?: Json | null
          max_float?: number | null
          min_float?: number | null
          name: string
          paint_index?: number | null
          pattern_id?: string | null
          pattern_name: string
          rarity_color?: string
          rarity_id?: string
          rarity_name?: string
          short_name?: string
          short_slug?: string
          slug?: string
          souvenir?: boolean | null
          stattrak?: boolean | null
          team_id?: string | null
          weapon_id?: string | null
          weapon_id_ref?: string | null
          weapon_name: string
          weapon_slug: string
          weapon_type?: string | null
        }
        Update: {
          case_ids?: string[]
          category_id?: string | null
          collections_name?: string | null
          collections_slug?: string | null
          description?: string | null
          id?: string
          image?: string
          in_cases?: Json | null
          max_float?: number | null
          min_float?: number | null
          name?: string
          paint_index?: number | null
          pattern_id?: string | null
          pattern_name?: string
          rarity_color?: string
          rarity_id?: string
          rarity_name?: string
          short_name?: string
          short_slug?: string
          slug?: string
          souvenir?: boolean | null
          stattrak?: boolean | null
          team_id?: string | null
          weapon_id?: string | null
          weapon_id_ref?: string | null
          weapon_name?: string
          weapon_slug?: string
          weapon_type?: string | null
        }
        Relationships: []
      }
      skins_collections: {
        Row: {
          collection_id: string
          skin_id: string
        }
        Insert: {
          collection_id: string
          skin_id: string
        }
        Update: {
          collection_id?: string
          skin_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'skins_collections_collection_id_fkey'
            columns: ['collection_id']
            isOneToOne: false
            referencedRelation: 'collections'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'skins_collections_skin_id_fkey'
            columns: ['skin_id']
            isOneToOne: false
            referencedRelation: 'skins'
            referencedColumns: ['weapon_id']
          }
        ]
      }
      souvenir_packages: {
        Row: {
          contains: Json
          contains_rare: Json
          description: string | null
          first_sale_date: string | null
          id: string
          image: string
          name: string
          short_name: string
          slug: string
          type: string
        }
        Insert: {
          contains?: Json
          contains_rare?: Json
          description?: string | null
          first_sale_date?: string | null
          id: string
          image?: string
          name: string
          short_name?: string
          slug: string
          type?: string
        }
        Update: {
          contains?: Json
          contains_rare?: Json
          description?: string | null
          first_sale_date?: string | null
          id?: string
          image?: string
          name?: string
          short_name?: string
          slug?: string
          type?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          name: string
          slug: string | null
          team_id: string | null
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          team_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          team_id?: string | null
        }
        Relationships: []
      }
      weapons: {
        Row: {
          ammo_reserve: string | null
          armor_pen: string | null
          btk_chest_short: string | null
          bttk_chest_long: string | null
          crouch_inacc: string | null
          dam_long_armor: string | null
          dam_long_no_armor: string | null
          dam_short_armor: string | null
          dam_short_no_armor: string | null
          fire_inacc: string | null
          fire_rate: string | null
          full_auto: boolean | null
          id: string
          image: string | null
          kill_reward: string | null
          mag_size: string | null
          movement_speed: string | null
          name: string
          price: string | null
          raw_damage: string | null
          recoil: string | null
          recover_time_crouch: string | null
          recover_time_stand: string | null
          reload_time: string | null
          run_inacc: string | null
          slug: string
          stand_inacc: string | null
          ttk_long: string | null
          ttk_short: string | null
          type: string
          weapon_id: string
        }
        Insert: {
          ammo_reserve?: string | null
          armor_pen?: string | null
          btk_chest_short?: string | null
          bttk_chest_long?: string | null
          crouch_inacc?: string | null
          dam_long_armor?: string | null
          dam_long_no_armor?: string | null
          dam_short_armor?: string | null
          dam_short_no_armor?: string | null
          fire_inacc?: string | null
          fire_rate?: string | null
          full_auto?: boolean | null
          id?: string
          image?: string | null
          kill_reward?: string | null
          mag_size?: string | null
          movement_speed?: string | null
          name: string
          price?: string | null
          raw_damage?: string | null
          recoil?: string | null
          recover_time_crouch?: string | null
          recover_time_stand?: string | null
          reload_time?: string | null
          run_inacc?: string | null
          slug: string
          stand_inacc?: string | null
          ttk_long?: string | null
          ttk_short?: string | null
          type: string
          weapon_id: string
        }
        Update: {
          ammo_reserve?: string | null
          armor_pen?: string | null
          btk_chest_short?: string | null
          bttk_chest_long?: string | null
          crouch_inacc?: string | null
          dam_long_armor?: string | null
          dam_long_no_armor?: string | null
          dam_short_armor?: string | null
          dam_short_no_armor?: string | null
          fire_inacc?: string | null
          fire_rate?: string | null
          full_auto?: boolean | null
          id?: string
          image?: string | null
          kill_reward?: string | null
          mag_size?: string | null
          movement_speed?: string | null
          name?: string
          price?: string | null
          raw_damage?: string | null
          recoil?: string | null
          recover_time_crouch?: string | null
          recover_time_stand?: string | null
          reload_time?: string | null
          run_inacc?: string | null
          slug?: string
          stand_inacc?: string | null
          ttk_long?: string | null
          ttk_short?: string | null
          type?: string
          weapon_id?: string
        }
        Relationships: []
      }
      wears: {
        Row: {
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          id: string
          name: string
          slug?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views']) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
  ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
  ? PublicSchema['Enums'][PublicEnumNameOrOptions]
  : never
