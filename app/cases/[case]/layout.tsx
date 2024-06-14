import { createClient } from '@/utils/supabase/client'

export async function generateStaticParams() {
  const supabase = createClient()
  const { data, error } = await supabase.from('crates').select('slug')

  if (error) {
    return []
  }

  return data.map((post) => ({
    case: post.slug,
  }))
}

export default function Layout({ children, params }: { children: React.ReactNode; params: { case: string } }) {
  return <>{children}</>
}
