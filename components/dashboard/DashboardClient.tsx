'use client'

import { useState } from 'react'
import ProductionTab from './tabs/ProductionTab'
import FinanceTab from './tabs/FinanceTab'
import GenerationsTab from './tabs/GenerationsTab'
import type { Generation } from '@/types'

type Props = {
  generations: Generation[]
  genNames: string[]
  productionStats: { name: string; week: number; month: number; year: number; total: number }[]
  monthlyProduction: Record<string, string | number>[]
  monthlySales: Record<string, string | number>[]
  salesByCustomer: { name: string; total: number }[]
  salesByCustomerType: { name: string; value: number }[]
  financialSummary: { name: string; income: number; acquisitionCost: number; operationalCost: number; totalCost: number; operationalProfit: number; totalProfit: number }[]
  totals: { income: number; acquisitionCost: number; operationalCost: number; totalCost: number; operationalProfit: number; totalProfit: number }
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
      <div className="flex items-center gap-0 border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap"
            style={
              tab === t.key
                ? { borderColor: 'var(--accent)', color: 'var(--accent)' }
                : { borderColor: 'transparent', color: 'var(--text-muted)' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'produkce' && (
        <ProductionTab
          genNames={props.genNames}
          productionStats={props.productionStats}
          monthlyProduction={props.monthlyProduction}
        />
      )}
      {tab === 'finance' && (
        <FinanceTab
          genNames={props.genNames}
          monthlySales={props.monthlySales}
          salesByCustomer={props.salesByCustomer}
          salesByCustomerType={props.salesByCustomerType}
          financialSummary={props.financialSummary}
          totals={props.totals}
        />
      )}
      {tab === 'generace' && (
        <GenerationsTab generations={props.generations} />
      )}
    </div>
  )
}
