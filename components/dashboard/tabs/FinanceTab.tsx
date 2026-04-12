'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts'

const GEN_COLORS = ['#d97706', '#3b82f6', '#10b981', '#8b5cf6']
const TYPE_COLORS = ['#d97706', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e']

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

function StatCard({ label, value, positive, neutral }: { label: string; value: number; positive?: boolean; neutral?: boolean }) {
  const isPositive = value >= 0
  const color = neutral ? 'text-gray-800' : isPositive ? 'text-green-600' : 'text-red-500'
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${color}`}>{fmt(value)}</p>
    </div>
  )
}

type FinSummary = { name: string; income: number; acquisitionCost: number; operationalCost: number; totalCost: number; operationalProfit: number; totalProfit: number }
type Totals = { income: number; acquisitionCost: number; operationalCost: number; totalCost: number; operationalProfit: number; totalProfit: number }

type Props = {
  genNames: string[]
  monthlySales: Record<string, string | number>[]
  salesByCustomer: { name: string; total: number }[]
  salesByCustomerType: { name: string; value: number }[]
  financialSummary: FinSummary[]
  totals: Totals
}

export default function FinanceTab({ genNames, monthlySales, salesByCustomer, salesByCustomerType, financialSummary, totals }: Props) {
  const totalLabel = totals.totalProfit >= 0 ? 'Celkový zisk' : 'Celková ztráta'
  const opProfitLabel = 'Provozní zisk'

  return (
    <div className="space-y-6">
      {/* Souhrnné karty */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Celkový přehled</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Celkové příjmy" value={totals.income} neutral />
          <StatCard label="Celkové náklady" value={-totals.totalCost} />
          <StatCard label={totalLabel} value={totals.totalProfit} />
          <StatCard label={opProfitLabel} value={totals.operationalProfit} />
        </div>
      </div>

      {/* Per-generace karty */}
      {financialSummary.map((g, i) => (
        <div key={g.name}>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3" style={{ color: GEN_COLORS[i] }}>
            {g.name} generace
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Příjmy" value={g.income} neutral />
            <StatCard label="Pořizovací náklady" value={-g.acquisitionCost} />
            <StatCard label="Provozní náklady" value={-g.operationalCost} />
            <StatCard label="Celkové náklady" value={-g.totalCost} />
            <StatCard label="Provozní zisk/ztráta" value={g.operationalProfit} />
            <StatCard label={g.totalProfit >= 0 ? 'Celkový zisk' : 'Celková ztráta'} value={g.totalProfit} />
          </div>
        </div>
      ))}

      {/* Graf prodeje po měsících */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-700 mb-4">Prodej po měsících</h2>
        {monthlySales.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Žádná data</p>
        ) : (
          <div onMouseDown={e => e.preventDefault()}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySales} margin={{ top: 4, right: 4, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, angle: -45, textAnchor: 'end', dy: 4 }} height={55} interval={0} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 8 }} />
                {genNames.map((g, i) => (
                  <Bar key={g} dataKey={g} stackId="a" fill={GEN_COLORS[i]} radius={i === genNames.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} activeBar={false} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Grafy zákazníků */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prodej podle zákazníků */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-700 mb-4">Prodej podle zákazníků</h2>
          {salesByCustomer.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Žádná data</p>
          ) : (
            <div onMouseDown={e => e.preventDefault()}>
              <ResponsiveContainer width="100%" height={Math.max(180, salesByCustomer.length * 36)}>
                <BarChart
                  data={salesByCustomer}
                  layout="vertical"
                  margin={{ top: 0, right: 90, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                  <Bar dataKey="total" fill="#d97706" radius={[0, 3, 3, 0]} activeBar={false} label={{ position: 'right', fontSize: 11, formatter: (v: unknown) => fmt(Number(v)) }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Prodej podle typu zákazníka */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-semibold text-gray-700 mb-4">Prodej podle typu zákazníka</h2>
          {salesByCustomerType.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Žádná data</p>
          ) : (
            <>
              <div onMouseDown={e => e.preventDefault()}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={salesByCustomerType}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    activeShape={false}
                  >
                    {salesByCustomerType.map((_, i) => (
                      <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {salesByCustomerType.map((t, i) => {
                  const total = salesByCustomerType.reduce((s, x) => s + x.value, 0)
                  const pct = total > 0 ? ((t.value / total) * 100).toFixed(0) : '0'
                  return (
                    <div key={t.name} className="flex items-center gap-1.5 text-sm">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                      <span className="text-gray-600">{t.name}</span>
                      <span className="font-medium">{fmt(t.value)}</span>
                      <span className="text-gray-400">({pct}%)</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
