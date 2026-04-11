import { createClient } from '@/lib/supabase/server'
import CostForm from '@/components/naklady/CostForm'
import CostTable from '@/components/naklady/CostTable'

export default async function NakladyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [generationsRes, costsRes] = await Promise.all([
    supabase.from('generations').select('*').eq('user_id', user!.id).order('started_at'),
    supabase.from('costs')
      .select('*, generation:generations(name)')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
      .limit(200),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-amber-900">🛒 Náklady</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CostForm generations={generationsRes.data ?? []} />
        </div>
        <div className="lg:col-span-2">
          <CostTable costs={costsRes.data ?? []} />
        </div>
      </div>
    </div>
  )
}
