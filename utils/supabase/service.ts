import { Database } from '@/types/database'
import { createClient } from '@supabase/supabase-js'

export const createServiceClient = () => {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
