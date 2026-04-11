import { createClient } from '@/lib/supabase/server'
import ProductionForm from '@/components/snaska/ProductionForm'
import ProductionTable from '@/components/snaska/ProductionTable'
import FilterBar from '@/components/FilterBar'

type Props = { searchParams: Promise<Record<string, string>> }

export default async function SnaskaPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const generationsRes = await supabase
    .from('generations').select('*').eq('user_id', user!.id).order('started_at')
  const generations = generationsRes.data ?? []

  let query = supabase
    .from('productions')
    .select('*, generation:generations(name)')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })

  if (params.from) query = query.gte('date', params.from)
  if (params.to) query = query.lte('date', params.to)
  if (params.generation) query = query.eq('generation_id', params.generation)

  const { data: productions } = await query

  const filterFields = [
    { type: 'date-range' as const },
    {
      type: 'select' as const,
      key: 'generation',
      label: 'Generace',
      options: generations.map((g) => ({ value: g.id, label: g.name })),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-amber-900">🥚 Snáška</h1>
      <FilterBar fields={filterFields} resultCount={productions?.length ?? 0} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ProductionForm generations={generations} />
        </div>
        <div className="lg:col-span-2">
          <ProductionTable productions={productions ?? []} />
        </div>
      </div>
    </div>
  )
}
