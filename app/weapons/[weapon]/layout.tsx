import { createClient } from '@/utils/supabase/client'

export async function generateStaticParams() {
  const supabase = createClient()
  const { data, error } = await supabase.from('weapons').select('slug')

  if (error) {
    return []
  }

  return data.map((post) => ({
    weapon: post.slug,
  }))
}

export default function Layout({ children, params }: { children: React.ReactNode; params: { weapon: string } }) {
  return <main className="w-full h-full flex-1 overflow-y-auto">{children}</main>
}
