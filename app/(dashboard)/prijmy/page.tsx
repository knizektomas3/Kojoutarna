import { createClient } from '@/lib/supabase/server'
import IncomeForm from '@/components/prijmy/IncomeForm'
import IncomeTable from '@/components/prijmy/IncomeTable'
import FilterBar from '@/components/FilterBar'

type Props = { searchParams: Promise<Record<string, string>> }

const PAGE_SIZE = 10

export default async function PrijmyPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [generationsRes, customersRes] = await Promise.all([
    supabase.from('generations').select('*').eq('user_id', user!.id).order('started_at'),
    supabase.from('customers').select('id, name').eq('user_id', user!.id).order('name'),
  ])
  const generations = generationsRes.data ?? []
  const customers = customersRes.data ?? []

  let query = supabase
    .from('incomes')
    .select('*, generation:generations(name)', { count: 'exact' })
    .eq('user_id', user!.id)
    .order('date', { ascending: false })

  if (params.from) query = query.gte('date', params.from)
  if (params.to) query = query.lte('date', params.to)
  if (params.generation) query = query.eq('generation_id', params.generation)
  if (params.customer) query = query.eq('customer_name', params.customer)
  if (params.customer_type) query = query.eq('customer_type', params.customer_type)

  const from = (page - 1) * PAGE_SIZE
  const { data: incomes, count } = await query.range(from, from + PAGE_SIZE - 1)

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
      key: 'customer',
      label: 'Zákazník',
      options: customers.map((c) => ({ value: c.name, label: c.name })),
    },
    {
      type: 'select' as const,
      key: 'customer_type',
      label: 'Typ zákazníka',
      options: ['Rodina', 'Známí', 'Facebook', 'Jiné'].map((t) => ({ value: t, label: t })),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-amber-900">💰 Příjmy</h1>
      <FilterBar fields={filterFields} resultCount={count ?? 0} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <IncomeForm generations={generations} customers={customers} />
        </div>
        <div className="lg:col-span-2">
          <IncomeTable incomes={incomes ?? []} page={page} total={count ?? 0} pageSize={PAGE_SIZE} />
        </div>
      </div>
    </div>
  )
}
