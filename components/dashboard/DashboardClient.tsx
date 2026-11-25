'use client'

import { useState } from 'react'
import ProductionTab from './tabs/ProductionTab'
import FinanceTab from './tabs/FinanceTab'
import GenerationsTab from './tabs/GenerationsTab'
import type { Generation } from '@/types'

type Props = {
  generations: Generation[]
  genNames: string[]
  productionStats: { name: string; week: number; month: number; year: number; total: number; henCount: number | null; missingDays: number; lastProdDate: string | null; daysIntoWeek: number; monthTrend: number | null }[]
  monthlyProduction: Record<string, string | number>[]
  monthlySales: Record<string, string | number>[]
  salesByCustomer: { name: string; total: number }[]
  salesByCustomerType: { name: string; value: number }[]
  financialSummary: { name: string; income: number; acquisitionCost: number; operationalCost: number; totalCost: number; operationalProfit: number; totalProfit: number }[]
  totals: { income: number; acquisitionCost: number; operationalCost: number; totalCost: number; operationalProfit: number; totalProfit: number }
  avgEggsPerDay: Record<string, number>
  perGenFinance: { name: string; costPerEgg: number | null; avgMonthlyIncome: number; avgMonthlyCost: number }[]
  customerStats: { name: string; total: number; count: number; avgPurchase: number; activeMonths: number }[]
  generationComparison: { id: string; name: string; isActive: boolean; totalEggs: number; eggsPerHen: number | null; avgEggsPerDay: number; durationDays: number; income: number; totalCost: number; totalProfit: number; roi: number | null }[]
}

const TABS = [
  { key: 'produkce', label: '🥚 Přehled produkce' },
  { key: 'finance',  label: '💰 Finanční přehled' },
  { key: 'generace', label: '🐔 Generace' },
] as const

type Tab = typeof TABS[number]['key']

export default function DashboardClient(props: Props) {
  const [tab, setTab] = useState<Tab>('produkce')

  return (
    <div className="space-y-5">
      <div className="flex items-center overflow-x-auto border-b" style={{ borderColor: 'var(--border)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-3 text-sm font-bold border-b-2 transition-all -mb-px whitespace-nowrap flex-shrink-0 tracking-tight"
            style={
              tab === t.key
                ? { borderColor: 'var(--accent)', color: 'var(--accent)' }
                : { borderColor: 'transparent', color: 'var(--text-subtle)' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: tab === 'produkce' ? 'block' : 'none' }}>
        <ProductionTab
          genNames={props.genNames}
          productionStats={props.productionStats}
          monthlyProduction={props.monthlyProduction}
        />
      </div>
      <div style={{ display: tab === 'finance' ? 'block' : 'none' }}>
        <FinanceTab
          genNames={props.genNames}
          monthlySales={props.monthlySales}
          salesByCustomer={props.salesByCustomer}
          salesByCustomerType={props.salesByCustomerType}
          financialSummary={props.financialSummary}
          totals={props.totals}
          perGenFinance={props.perGenFinance}
          customerStats={props.customerStats}
        />
      </div>
      <div style={{ display: tab === 'generace' ? 'block' : 'none' }}>
        <GenerationsTab generations={props.generations} avgEggsPerDay={props.avgEggsPerDay} generationComparison={props.generationComparison} />
      </div>
    </div>
  )
}
