import { createClient } from '@/lib/supabase/server'
import ProductionForm from '@/components/snaska/ProductionForm'
import ProductionTable from '@/components/snaska/ProductionTable'

export default async function SnaskaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [generationsRes, productionsRes] = await Promise.all([
    supabase.from('generations').select('*').eq('user_id', user!.id).order('started_at'),
    supabase.from('productions')
      .select('*, generation:generations(name)')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
      .limit(100),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-amber-900">🥚 Snáška</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProductionForm generations={generationsRes.data ?? []} />
        </div>
        <div className="lg:col-span-2">
          <ProductionTable productions={productionsRes.data ?? []} />
        </div>
      </div>
    </div>
  )
}
