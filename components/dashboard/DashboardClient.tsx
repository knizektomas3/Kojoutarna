'use client'

import { useState } from 'react'
import ProductionTab from './tabs/ProductionTab'
import FinanceTab from './tabs/FinanceTab'

type Props = {
  generations: any[]
  genNames: string[]
  productionStats: { name: string; week: number; month: number; year: number; total: number }[]
  monthlyProduction: Record<string, string | number>[]
  monthlySales: Record<string, string | number>[]
  salesByCustomer: { name: string; total: number }[]
  salesByCustomerType: { name: string; value: number }[]
  financialSummary: { name: string; income: number; acquisitionCost: number; operationalCost: number; totalCost: number; operationalProfit: number; totalProfit: number }[]
  totals: { income: number; acquisitionCost: number; operationalCost: number; totalCost: number; operationalProfit: number; totalProfit: number }
}

export default function DashboardClient(props: Props) {
  const [tab, setTab] = useState<'produkce' | 'finance'>('produkce')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border-b border-gray-200">
        {(['produkce', 'finance'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? 'border-amber-700 text-amber-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'produkce' ? '🥚 Přehled produkce' : '💰 Finanční přehled'}
          </button>
        ))}
      </div>

      {tab === 'produkce' ? (
        <ProductionTab
          genNames={props.genNames}
          productionStats={props.productionStats}
          monthlyProduction={props.monthlyProduction}
        />
      ) : (
        <FinanceTab
          genNames={props.genNames}
          monthlySales={props.monthlySales}
          salesByCustomer={props.salesByCustomer}
          salesByCustomerType={props.salesByCustomerType}
          financialSummary={props.financialSummary}
          totals={props.totals}
        />
      )}
    </div>
  )
}
