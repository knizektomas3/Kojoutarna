import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

function formatMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [generationsRes, allProductionsRes, allIncomesRes, allCostsRes] = await Promise.all([
    supabase.from('generations').select('*').eq('user_id', user!.id).order('started_at'),
    supabase.from('productions').select('*, generation:generations(name)').eq('user_id', user!.id).order('date'),
    supabase.from('incomes').select('*, generation:generations(name)').eq('user_id', user!.id).order('date'),
    supabase.from('costs').select('*, generation:generations(name)').eq('user_id', user!.id).order('date'),
  ])

  const generations = generationsRes.data ?? []
  const allProductions = allProductionsRes.data ?? []
  const allIncomes = allIncomesRes.data ?? []
  const allCosts = allCostsRes.data ?? []
  const genNames = generations.map(g => g.name)

  // ── Datumové hranice ──────────────────────────────────────────────────
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const dow = today.getDay()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const monthStartStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
  const yearStartStr = `${today.getFullYear()}-01-01`

  // ── Statistiky snášky ─────────────────────────────────────────────────
  const productionStats = generations.map(g => {
    const gp = allProductions.filter(p => p.generation_id === g.id)
    const sum = (from: string) => gp.filter(p => p.date >= from && p.date <= todayStr).reduce((s, p) => s + p.egg_count, 0)
    return { name: g.name, week: sum(weekStartStr), month: sum(monthStartStr), year: sum(yearStartStr), total: gp.reduce((s, p) => s + p.egg_count, 0) }
  })

  // ── Snáška po měsících ────────────────────────────────────────────────
  const prodByMonth: Record<string, Record<string, number>> = {}
  for (const p of allProductions) {
    const m = p.date.slice(0, 7)
    const g = (p.generation as any)?.name ?? '?'
    if (!prodByMonth[m]) prodByMonth[m] = {}
    prodByMonth[m][g] = (prodByMonth[m][g] || 0) + p.egg_count
  }
  const monthlyProduction = Object.keys(prodByMonth).sort().map(m => ({
    month: formatMonth(m),
    ...Object.fromEntries(genNames.map(g => [g, prodByMonth[m]?.[g] || 0])),
  }))

  // ── Prodej po měsících ────────────────────────────────────────────────
  const salesByMonth: Record<string, Record<string, number>> = {}
  for (const i of allIncomes) {
    const m = i.date.slice(0, 7)
    const g = (i.generation as any)?.name ?? '?'
    if (!salesByMonth[m]) salesByMonth[m] = {}
    salesByMonth[m][g] = (salesByMonth[m][g] || 0) + i.amount
  }
  const monthlySales = Object.keys(salesByMonth).sort().map(m => ({
    month: formatMonth(m),
    ...Object.fromEntries(genNames.map(g => [g, salesByMonth[m]?.[g] || 0])),
  }))

  // ── Prodej podle zákazníků ────────────────────────────────────────────
  const byCustomer: Record<string, number> = {}
  for (const i of allIncomes) {
    const name = i.customer_name ?? '—'
    if (name === 'Historická data') continue
    byCustomer[name] = (byCustomer[name] || 0) + i.amount
  }
  const salesByCustomer = Object.entries(byCustomer)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 15)

  // ── Prodej podle typu zákazníka ───────────────────────────────────────
  const byType: Record<string, number> = {}
  for (const i of allIncomes) {
    if (i.customer_name === 'Historická data') continue
    const t = i.customer_type ?? 'Jiné'
    byType[t] = (byType[t] || 0) + i.amount
  }
  const salesByCustomerType = Object.entries(byType).map(([name, value]) => ({ name, value }))

  // ── Finanční přehled ──────────────────────────────────────────────────
  const financialSummary = generations.map(g => {
    const income = allIncomes.filter(i => i.generation_id === g.id).reduce((s, i) => s + i.amount, 0)
    const acq = allCosts.filter(c => c.generation_id === g.id && c.cost_category === 'Pořizovací').reduce((s, c) => s + c.amount, 0)
    const ops = allCosts.filter(c => c.generation_id === g.id && c.cost_category === 'Provozní').reduce((s, c) => s + c.amount, 0)
    return { name: g.name, income, acquisitionCost: acq, operationalCost: ops, totalCost: acq + ops, operationalProfit: income - ops, totalProfit: income - acq - ops }
  })

  const totals = financialSummary.reduce((acc, g) => ({
    income: acc.income + g.income,
    acquisitionCost: acc.acquisitionCost + g.acquisitionCost,
    operationalCost: acc.operationalCost + g.operationalCost,
    totalCost: acc.totalCost + g.totalCost,
    operationalProfit: acc.operationalProfit + g.operationalProfit,
    totalProfit: acc.totalProfit + g.totalProfit,
  }), { income: 0, acquisitionCost: 0, operationalCost: 0, totalCost: 0, operationalProfit: 0, totalProfit: 0 })

  return (
    <DashboardClient
      generations={generations}
      genNames={genNames}
      productionStats={productionStats}
      monthlyProduction={monthlyProduction}
      monthlySales={monthlySales}
      salesByCustomer={salesByCustomer}
      salesByCustomerType={salesByCustomerType}
      financialSummary={financialSummary}
      totals={totals}
    />
  )
}
