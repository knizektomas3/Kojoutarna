'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
  LineChart, Line, ReferenceLine,
} from 'recharts'

const GEN_COLORS = ['#c97318', '#3272c0', '#1f9268', '#7c5bbf']
const TYPE_COLORS = ['#c97318', '#3272c0', '#1f9268', '#7c5bbf', '#c05068']

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

function fmtShort(n: number) {
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(0)} tis.`
  return String(n)
}

function ChartTooltip({ active, payload, label, format }: { active?: boolean; payload?: readonly any[]; label?: string; format: (v: number) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: 'var(--shadow-md)',
      fontSize: 12,
      minWidth: 160,
    }}>
      {label && (
        <p style={{ color: 'var(--text-subtle)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
          {label}
        </p>
      )}
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: i > 0 ? 5 : 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: entry.fill ?? entry.color, flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)', flex: 1 }}>{entry.name}</span>
          <span style={{ color: 'var(--text)', fontWeight: 700 }}>{format(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, neutral }: { label: string; value: number; neutral?: boolean }) {
  const color = neutral ? 'var(--text)' : value >= 0 ? '#16a34a' : '#ef4444'
  return (
    <div className="card p-3 sm:p-4 min-w-0">
      <p className="text-xs font-semibold mb-1.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm sm:text-base font-bold tabular-nums" style={{ color, wordBreak: 'break-all' }}>{fmt(value)}</p>
    </div>
  )
}

type FinSummary = { name: string; income: number; acquisitionCost: number; operationalCost: number; totalCost: number; operationalProfit: number; totalProfit: number }
type Totals = { income: number; acquisitionCost: number; operationalCost: number; totalCost: number; operationalProfit: number; totalProfit: number }
type PerGenFin = { name: string; costPerEgg: number | null; avgMonthlyIncome: number; avgMonthlyCost: number }
type CustomerStat = { name: string; total: number; count: number; avgPurchase: number; activeMonths: number }

type Props = {
  genNames: string[]
  monthlySales: Record<string, string | number>[]
  salesByCustomer: { name: string; total: number }[]
  salesByCustomerType: { name: string; value: number }[]
  financialSummary: FinSummary[]
  totals: Totals
  perGenFinance: PerGenFin[]
  customerStats: CustomerStat[]
  cumulativeCashflow: Record<string, string | number>[]
}

export default function FinanceTab({ genNames, monthlySales, salesByCustomer, salesByCustomerType, financialSummary, totals, perGenFinance, customerStats, cumulativeCashflow }: Props) {
  return (
    <div className="space-y-6">
      {/* Souhrnné karty */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-subtle)' }}>Celkový přehled</h2>
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
        const pgf = perGenFinance.find(p => p.name === g.name)
        return (
          <div key={g.name}>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GEN_COLORS[i] }}>
              {g.name} generace
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <StatCard label="Příjmy" value={g.income} neutral />
              <StatCard label="Pořizovací nákl." value={-g.acquisitionCost} />
              <StatCard label="Provozní nákl." value={-g.operationalCost} />
              <StatCard label="Celkové nákl." value={-g.totalCost} />
              <StatCard label="Provozní zisk/ztráta" value={g.operationalProfit} />
              <StatCard label={g.totalProfit >= 0 ? 'Celkový zisk' : 'Celková ztráta'} value={g.totalProfit} />
              <div className="card p-3 sm:p-4 min-w-0">
                <p className="text-xs font-semibold mb-1.5 leading-snug" style={{ color: 'var(--text-muted)' }}>Návratnost (ROI)</p>
                {roi === null ? (
                  <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-subtle)' }}>—</p>
                ) : (
                  <p className="text-sm sm:text-base font-bold tabular-nums" style={{ color: roi >= 0 ? '#16a34a' : '#ef4444' }}>
                    {roi >= 0 ? '+' : ''}{roi.toFixed(0)} %
                  </p>
                )}
              </div>
            </div>

            {pgf && (
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mt-3">
                <div className="card p-3 sm:p-4 min-w-0">
                  <p className="text-xs font-semibold mb-1.5 leading-snug" style={{ color: 'var(--text-muted)' }}>Provozní náklady / vejce</p>
                  <p className="text-sm sm:text-base font-bold tabular-nums" style={{ color: 'var(--text)' }}>
                    {pgf.costPerEgg !== null ? `${pgf.costPerEgg.toFixed(2)} Kč` : '—'}
                  </p>
                </div>
                <div className="card p-3 sm:p-4 min-w-0">
                  <p className="text-xs font-semibold mb-1.5 leading-snug" style={{ color: 'var(--text-muted)' }}>Ø příjem / měsíc</p>
                  <p className="text-sm sm:text-base font-bold tabular-nums" style={{ color: 'var(--text)' }}>
                    {fmt(pgf.avgMonthlyIncome)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Graf prodeje po měsících */}
      <div className="card p-5 sm:p-6">
        <h2 className="font-bold text-sm tracking-tight mb-5" style={{ color: 'var(--text)' }}>Prodej po měsících</h2>
        {monthlySales.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: 'var(--text-subtle)' }}>Žádná data</p>
        ) : (
          <div onMouseDown={e => e.preventDefault()}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySales} margin={{ top: 4, right: 8, left: 0, bottom: 14 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="0" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, angle: -40, textAnchor: 'end', dy: 4 }}
                  height={52}
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />
                <Tooltip
                  content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload} label={String(label ?? '')} format={fmt} />}
                  cursor={{ fill: 'var(--surface-alt)', radius: 6 }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 12, fontSize: 12 }} />
                {genNames.map((g, i) => (
                  <Bar
                    key={g}
                    dataKey={g}
                    stackId="a"
                    fill={GEN_COLORS[i]}
                    radius={i === genNames.length - 1 ? [5, 5, 0, 0] : [0, 0, 0, 0]}
                    activeBar={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Grafy zákazníků */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Prodej podle zákazníků */}
        <div className="card p-5 sm:p-6">
          <h2 className="font-bold text-sm tracking-tight mb-5" style={{ color: 'var(--text)' }}>Prodej podle zákazníků</h2>
          {salesByCustomer.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: 'var(--text-subtle)' }}>Žádná data</p>
          ) : (
            <div onMouseDown={e => e.preventDefault()}>
              <ResponsiveContainer width="100%" height={Math.max(200, salesByCustomer.length * 40)}>
                <BarChart data={salesByCustomer} layout="vertical" margin={{ top: 0, right: 72, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" stroke="var(--chart-grid)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload} label={String(label ?? '')} format={fmt} />}
                    cursor={{ fill: 'var(--surface-alt)', radius: 4 }}
                  />
                  <Bar
                    dataKey="total"
                    fill="#c97318"
                    radius={[0, 5, 5, 0]}
                    activeBar={false}
                    label={{ position: 'right', fontSize: 11, fontWeight: 600, formatter: (v: unknown) => fmtShort(Number(v)), fill: 'var(--text-muted)' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Prodej podle typu zákazníka */}
        <div className="card p-5 sm:p-6">
          <h2 className="font-bold text-sm tracking-tight mb-5" style={{ color: 'var(--text)' }}>Prodej podle typu zákazníka</h2>
          {salesByCustomerType.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: 'var(--text-subtle)' }}>Žádná data</p>
          ) : (
            <>
              <div onMouseDown={e => e.preventDefault()}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={salesByCustomerType}
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      activeShape={false}
                      strokeWidth={0}
                    >
                      {salesByCustomerType.map((_, i) => (
                        <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => <ChartTooltip active={active} payload={payload} format={fmt} />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 mt-3">
                {salesByCustomerType.map((t, i) => {
                  const total = salesByCustomerType.reduce((s, x) => s + x.value, 0)
                  const pct = total > 0 ? ((t.value / total) * 100).toFixed(0) : '0'
                  return (
                    <div key={t.name} className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                        <span className="truncate" style={{ color: 'var(--text-muted)' }}>{t.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-bold" style={{ color: 'var(--text)' }}>{fmt(t.value)}</span>
                        <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detailní přehled zákazníků */}
      {customerStats.length > 0 && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>Detailní přehled zákazníků</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Zákazník</th>
                  <th className="text-right">Celkem</th>
                  <th className="text-right">Počet nákupů</th>
                  <th className="text-right">Průměr / nákup</th>
                  <th className="text-right">Aktivní měsíce</th>
                </tr>
              </thead>
              <tbody>
                {customerStats.map(c => (
                  <tr key={c.name}>
                    <td className="font-semibold">{c.name}</td>
                    <td className="text-right tabular-nums font-bold">{fmt(c.total)}</td>
                    <td className="text-right tabular-nums">{c.count}</td>
                    <td className="text-right tabular-nums">{fmt(c.avgPurchase)}</td>
                    <td className="text-right tabular-nums">{c.activeMonths}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kumulativní cashflow */}
      {cumulativeCashflow.length > 0 && (
        <div className="card p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>Kumulativní cashflow</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-subtle)' }}>Příjmy mínus náklady v čase — kladné hodnoty = kumulativní zisk</p>
          </div>
          <div onMouseDown={e => e.preventDefault()}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={cumulativeCashflow} margin={{ top: 4, right: 8, left: 0, bottom: 14 }}>
                <CartesianGrid strokeDasharray="0" stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, angle: -40, textAnchor: 'end', dy: 4 }}
                  height={52}
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k Kč`}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  content={({ active, payload, label }) => <ChartTooltip active={active} payload={payload} label={String(label ?? '')} format={fmt} />}
                  cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 12, fontSize: 12 }} />
                <ReferenceLine y={0} strokeDasharray="4 4" stroke="var(--border-strong)" />
                {genNames.map((g, i) => (
                  <Line
                    key={g}
                    type="monotone"
                    dataKey={g}
                    stroke={GEN_COLORS[i % GEN_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
