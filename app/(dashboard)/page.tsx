import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export const dynamic = 'force-dynamic'

function formatMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('cs-CZ', { month: 'short', year: '2-digit' })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [generationsRes, allProductionsRes, allIncomesRes, allCostsRes] = await Promise.all([
    supabase.from('generations').select('*').eq('user_id', user.id).order('started_at'),
    supabase.from('productions').select('*, generation:generations(name)').eq('user_id', user.id).order('date'),
    supabase.from('incomes').select('*, generation:generations(name)').eq('user_id', user.id).order('date'),
    supabase.from('costs').select('*, generation:generations(name)').eq('user_id', user.id).order('date'),
  ])

  const generations = generationsRes.data ?? []
  const allProductions = allProductionsRes.data ?? []
  const allIncomes = allIncomesRes.data ?? []
  const allCosts = allCostsRes.data ?? []
  const genNames = generations.map(g => g.name)

  // ── Datumové hranice (Europe/Prague timezone) ─────────────────────────
  const fmtDate = (d: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Prague' }).format(d)

  const todayStr = fmtDate(new Date())
  const [tyear, tmonth, tday] = todayStr.split('-').map(Number)
  // tmonth je 1–12

  // Veškeré aritmetiky děláme jako UTC noon, aby DST neovlivnilo výsledek
  const utcNoon = (y: number, m0: number, d: number) => new Date(Date.UTC(y, m0, d, 12))

  const dow = utcNoon(tyear, tmonth - 1, tday).getUTCDay() // 0=Ne..6=So
  const weekStartStr = fmtDate(utcNoon(tyear, tmonth - 1, tday - (dow === 0 ? 6 : dow - 1)))
  const monthStartStr = `${tyear}-${String(tmonth).padStart(2, '0')}-01`
  const yearStartStr  = `${tyear}-01-01`
  const daysIntoWeek  = dow === 0 ? 7 : dow

  const yesterdayStr      = fmtDate(utcNoon(tyear, tmonth - 1, tday - 1))
  const lastMonthDayCount = new Date(Date.UTC(tyear, tmonth - 1, 0)).getUTCDate()
  const lastMonthSameDay  = Math.min(tday, lastMonthDayCount)
  const lastMonthStartStr = fmtDate(utcNoon(tyear, tmonth - 2, 1))
  const lastMonthSameDayStr = fmtDate(utcNoon(tyear, tmonth - 2, lastMonthSameDay))

  // ── Průměr vajec/den na generaci ─────────────────────────────────────
  const avgEggsPerDay: Record<string, number> = {}
  for (const g of generations) {
    const gp = allProductions.filter(p => p.generation_id === g.id)
    const total = gp.reduce((s, p) => s + p.egg_count, 0)
    const end = g.ended_at ? new Date(g.ended_at) : new Date(todayStr)
    const days = Math.max(1, Math.round((end.getTime() - new Date(g.started_at).getTime()) / 86400000))
    avgEggsPerDay[g.id] = total / days
  }

  // ── Statistiky snášky ─────────────────────────────────────────────────
  const productionStats = generations.map(g => {
    const gp = allProductions.filter(p => p.generation_id === g.id)
    const sum = (from: string) => gp.filter(p => p.date >= from && p.date <= todayStr).reduce((s, p) => s + p.egg_count, 0)
    const lastProdDate = gp.length > 0 ? gp[gp.length - 1].date : null
    let missingDays = 0
    if (!g.ended_at) {
      if (!lastProdDate) {
        missingDays = Math.max(0, Math.round((new Date(yesterdayStr).getTime() - new Date(g.started_at).getTime()) / 86400000))
      } else if (lastProdDate < yesterdayStr) {
        missingDays = Math.round((new Date(yesterdayStr).getTime() - new Date(lastProdDate).getTime()) / 86400000)
      }
    }
    const lastMonthTotal = gp.filter(p => p.date >= lastMonthStartStr && p.date <= lastMonthSameDayStr).reduce((s, p) => s + p.egg_count, 0)
    const thisMonthTotal = sum(monthStartStr)
    const monthTrend = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : null
    return { name: g.name, week: sum(weekStartStr), month: thisMonthTotal, year: sum(yearStartStr), total: gp.reduce((s, p) => s + p.egg_count, 0), henCount: g.hen_count, missingDays, lastProdDate, daysIntoWeek, monthTrend }
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
    if (i.customer_name === 'Historická data') continue
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
  const custMap: Record<string, { total: number; count: number; months: Set<string> }> = {}
  for (const i of allIncomes) {
    const name = i.customer_name ?? '—'
    if (name === 'Historická data') continue
    if (!custMap[name]) custMap[name] = { total: 0, count: 0, months: new Set() }
    custMap[name].total += i.amount
    custMap[name].count += 1
    custMap[name].months.add(i.date.slice(0, 7))
  }
  const salesByCustomer = Object.entries(custMap)
    .map(([name, d]) => ({ name, total: d.total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
  const customerStats = Object.entries(custMap)
    .map(([name, d]) => ({ name, total: d.total, count: d.count, avgPurchase: Math.round(d.total / d.count), activeMonths: d.months.size }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

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

  // ── Per-vajce metriky + průměrné měsíční hodnoty ──────────────────────
  const perGenFinance = generations.map(g => {
    const gProds = allProductions.filter(p => p.generation_id === g.id)
    const totalEggs = gProds.reduce((s, p) => s + p.egg_count, 0)
    const fin = financialSummary.find(f => f.name === g.name)!
    const start = new Date(g.started_at)
    const endDate = g.ended_at ? new Date(g.ended_at) : new Date(todayStr)
    const durationDays = Math.max(1, Math.round((endDate.getTime() - start.getTime()) / 86400000))
    const months = Math.max(1, durationDays / 30.44)
    const costPerEgg = totalEggs > 0 && fin.operationalCost > 0 ? fin.operationalCost / totalEggs : null
    return { name: g.name, costPerEgg, avgMonthlyIncome: fin.income / months, avgMonthlyCost: fin.totalCost / months }
  })

  // ── Kumulativní cashflow po měsících ──────────────────────────────────
  const cfByMonth: Record<string, Record<string, number>> = {}
  for (const i of allIncomes) {
    const m = i.date.slice(0, 7)
    const gName = (i.generation as any)?.name ?? '?'
    if (!cfByMonth[m]) cfByMonth[m] = {}
    cfByMonth[m][gName] = (cfByMonth[m][gName] || 0) + i.amount
  }
  for (const c of allCosts) {
    const m = c.date.slice(0, 7)
    const gName = (c.generation as any)?.name ?? '?'
    if (!cfByMonth[m]) cfByMonth[m] = {}
    cfByMonth[m][gName] = (cfByMonth[m][gName] || 0) - c.amount
  }
  const cfCum: Record<string, number> = {}
  const cumulativeCashflow = Object.keys(cfByMonth).sort().map(m => {
    const row: Record<string, string | number> = { month: formatMonth(m) }
    for (const gName of genNames) {
      cfCum[gName] = (cfCum[gName] || 0) + (cfByMonth[m]?.[gName] || 0)
      row[gName] = cfCum[gName]
    }
    return row
  })

  // ── Srovnání generací ─────────────────────────────────────────────────
  const generationComparison = generations.map(g => {
    const gProds = allProductions.filter(p => p.generation_id === g.id)
    const totalEggs = gProds.reduce((s, p) => s + p.egg_count, 0)
    const fin = financialSummary.find(f => f.name === g.name)!
    const start = new Date(g.started_at)
    const endDate = g.ended_at ? new Date(g.ended_at) : new Date(todayStr)
    const durationDays = Math.round((endDate.getTime() - start.getTime()) / 86400000)
    const eggsPerHen = g.hen_count && g.hen_count > 0 ? totalEggs / g.hen_count : null
    const roi = fin.acquisitionCost > 0 ? (fin.totalProfit / fin.acquisitionCost) * 100 : null
    return { id: g.id, name: g.name, isActive: !g.ended_at, totalEggs, eggsPerHen, avgEggsPerDay: avgEggsPerDay[g.id] ?? 0, durationDays, income: fin.income, totalCost: fin.totalCost, totalProfit: fin.totalProfit, roi }
  })

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
      avgEggsPerDay={avgEggsPerDay}
      perGenFinance={perGenFinance}
      customerStats={customerStats}
      generationComparison={generationComparison}
    />
  )
}
