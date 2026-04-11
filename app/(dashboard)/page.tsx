import { createClient } from '@/lib/supabase/server'
import CashflowTable from '@/components/dashboard/CashflowTable'
import EggChart from '@/components/dashboard/EggChart'
import StatsCards from '@/components/dashboard/StatsCards'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [generationsRes, productionsRes, incomesRes, costsRes] = await Promise.all([
    supabase.from('generations').select('*').eq('user_id', user!.id).order('started_at'),
    supabase.from('productions').select('*, generation:generations(name)').eq('user_id', user!.id).order('date', { ascending: false }).limit(90),
    supabase.from('incomes').select('*, generation:generations(name)').eq('user_id', user!.id),
    supabase.from('costs').select('*, generation:generations(name)').eq('user_id', user!.id),
  ])

  const generations = generationsRes.data ?? []
  const productions = productionsRes.data ?? []
  const incomes = incomesRes.data ?? []
  const costs = costsRes.data ?? []

  // Cashflow per generation
  const cashflow = generations.map((g) => {
    const genIncomes = incomes.filter((i) => i.generation_id === g.id)
    const genCosts = costs.filter((c) => c.generation_id === g.id)
    const totalIncome = genIncomes.reduce((s, i) => s + i.amount, 0)
    const acquisitionCost = genCosts.filter((c) => c.cost_category === 'Pořizovací').reduce((s, c) => s + c.amount, 0)
    const operationalCost = genCosts.filter((c) => c.cost_category === 'Provozní').reduce((s, c) => s + c.amount, 0)
    const totalCost = acquisitionCost + operationalCost
    return {
      generation_id: g.id,
      generation_name: g.name,
      total_income: totalIncome,
      acquisition_cost: acquisitionCost,
      operational_cost: operationalCost,
      total_cost: totalCost,
      operational_profit: totalIncome - operationalCost,
      total_profit: totalIncome - totalCost,
    }
  })

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
  const totalCost = costs.reduce((s, c) => s + c.amount, 0)
  const totalEggs = productions.reduce((s, p) => s + p.egg_count, 0)

  // Last 30 days productions for chart
  const last30 = productions.slice(0, 30).reverse()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-amber-900">Přehled</h1>

      <StatsCards
        totalIncome={totalIncome}
        totalCost={totalCost}
        totalEggs={totalEggs}
        generationCount={generations.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Snáška – posledních 30 dní</h2>
          <EggChart data={last30} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-700 mb-3">Cashflow dle generací</h2>
          <CashflowTable cashflow={cashflow} />
        </div>
      </div>
    </div>
  )
}
