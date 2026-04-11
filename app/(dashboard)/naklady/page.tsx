import { createClient } from '@/lib/supabase/server'
import CostForm from '@/components/naklady/CostForm'
import CostTable from '@/components/naklady/CostTable'
import FilterBar from '@/components/FilterBar'

type Props = { searchParams: Promise<Record<string, string>> }

export default async function NakladyPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const generationsRes = await supabase
    .from('generations').select('*').eq('user_id', user!.id).order('started_at')
  const generations = generationsRes.data ?? []

  const SUBCATEGORIES = {
    Pořizovací: ['Slepice', 'Kurník', 'Ohrádka', 'Příslušenství', 'Jiné'],
    Provozní: ['Krmení', 'Podestýlka', 'Veterinář', 'Jiné'],
  }
  const allSubcategories = [...new Set([...SUBCATEGORIES['Pořizovací'], ...SUBCATEGORIES['Provozní']])]

  let query = supabase
    .from('costs')
    .select('*, generation:generations(name)')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })

  if (params.from) query = query.gte('date', params.from)
  if (params.to) query = query.lte('date', params.to)
  if (params.generation) query = query.eq('generation_id', params.generation)
  if (params.category) query = query.eq('cost_category', params.category)
  if (params.subcategory) query = query.eq('cost_subcategory', params.subcategory)

  const { data: costs } = await query

  const filterFields = [
    { type: 'date-range' as const },
    {
      type: 'select' as const,
      key: 'generation',
      label: 'Generace',
      options: generations.map((g) => ({ value: g.id, label: g.name })),
    },
    {
      type: 'select' as const,
      key: 'category',
      label: 'Typ nákladu',
      options: ['Pořizovací', 'Provozní'].map((c) => ({ value: c, label: c })),
    },
    {
      type: 'select' as const,
      key: 'subcategory',
      label: 'Kategorie',
      options: allSubcategories.map((s) => ({ value: s, label: s })),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-amber-900">🛒 Náklady</h1>
      <FilterBar fields={filterFields} resultCount={costs?.length ?? 0} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CostForm generations={generations} />
        </div>
        <div className="lg:col-span-2">
          <CostTable costs={costs ?? []} />
        </div>
      </div>
    </div>
  )
}
