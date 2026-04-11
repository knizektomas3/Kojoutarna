import { createClient } from '@/lib/supabase/server'
import IncomeForm from '@/components/prijmy/IncomeForm'
import IncomeTable from '@/components/prijmy/IncomeTable'

export default async function PrijmyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [generationsRes, incomesRes, customersRes] = await Promise.all([
    supabase.from('generations').select('*').eq('user_id', user!.id).order('started_at'),
    supabase.from('incomes')
      .select('*, generation:generations(name)')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
      .limit(200),
    supabase.from('customers').select('id, name').eq('user_id', user!.id).order('name'),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-amber-900">💰 Příjmy</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <IncomeForm generations={generationsRes.data ?? []} customers={customersRes.data ?? []} />
        </div>
        <div className="lg:col-span-2">
          <IncomeTable incomes={incomesRes.data ?? []} />
        </div>
      </div>
    </div>
  )
}
