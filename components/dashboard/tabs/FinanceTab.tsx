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

function StatCard({ label, value, neutral }: { label: string; value: number; neutral?: boolean }) {
  const color = neutral ? 'var(--text)' : value >= 0 ? '#16a34a' : '#ef4444'
  return (
    <div className="card p-4">
      <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color }}>{fmt(value)}</p>
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
  return (
    <div className="space-y-5">
      {/* Souhrnné karty */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-subtle)' }}>Celkový přehled</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Celkové příjmy" value={totals.income} neutral />
          <StatCard label="Celkové náklady" value={-totals.totalCost} />
          <StatCard label={totals.totalProfit >= 0 ? 'Celkový zisk' : 'Celková ztráta'} value={totals.totalProfit} />
          <StatCard label="Provozní zisk" value={totals.operationalProfit} />
        </div>
      </div>

      {/* Per-generace karty */}
      {financialSummary.map((g, i) => {
        const roi = g.acquisitionCost > 0 ? (g.totalProfit / g.acquisitionCost) * 100 : null
        return (
          <div key={g.name}>
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: GEN_COLORS[i] }}>
              {g.name} generace
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
              <StatCard label="Příjmy" value={g.income} neutral />
              <StatCard label="Pořizovací náklady" value={-g.acquisitionCost} />
              <StatCard label="Provozní náklady" value={-g.operationalCost} />
              <StatCard label="Celkové náklady" value={-g.totalCost} />
              <StatCard label="Provozní zisk/ztráta" value={g.operationalProfit} />
              <StatCard label={g.totalProfit >= 0 ? 'Celkový zisk' : 'Celková ztráta'} value={g.totalProfit} />
              <div className="card p-4">
                <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>Návratnost (ROI)</p>
                {roi === null ? (
                  <p className="text-xl font-bold" style={{ color: 'var(--text-subtle)' }}>—</p>
                ) : (
                  <p className="text-xl font-bold tabular-nums" style={{ color: roi >= 0 ? '#16a34a' : '#ef4444' }}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(0)} %
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Graf prodeje po měsících */}
      <div className="card p-5">
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>Prodej po měsících</h2>
        {monthlySales.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-subtle)' }}>Žádná data</p>
        ) : (
          <div onMouseDown={e => e.preventDefault()}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySales} margin={{ top: 4, right: 4, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, angle: -45, textAnchor: 'end', dy: 4 }} height={55} interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fmt(Number(v))} cursor={{ fill: 'var(--surface-alt)' }} />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Prodej podle zákazníků */}
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>Prodej podle zákazníků</h2>
          {salesByCustomer.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-subtle)' }}>Žádná data</p>
          ) : (
            <div onMouseDown={e => e.preventDefault()}>
              <ResponsiveContainer width="100%" height={Math.max(180, salesByCustomer.length * 36)}>
                <BarChart data={salesByCustomer} layout="vertical" margin={{ top: 0, right: 90, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => fmt(Number(v))} cursor={{ fill: 'var(--surface-alt)' }} />
                  <Bar dataKey="total" fill="#d97706" radius={[0, 3, 3, 0]} activeBar={false}
                    label={{ position: 'right', fontSize: 11, formatter: (v: unknown) => fmt(Number(v)), fill: 'var(--text-muted)' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Prodej podle typu zákazníka */}
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>Prodej podle typu zákazníka</h2>
          {salesByCustomerType.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-subtle)' }}>Žádná data</p>
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
                      <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                      <span style={{ color: 'var(--text-muted)' }}>{t.name}</span>
                      <span className="font-medium" style={{ color: 'var(--text)' }}>{fmt(t.value)}</span>
                      <span style={{ color: 'var(--text-subtle)' }}>({pct}%)</span>
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
